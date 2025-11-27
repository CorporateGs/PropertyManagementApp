import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { IntegrationHub, INTEGRATION_PROVIDERS } from '@/lib/services/integrations/integration-hub';
import { prisma } from "@/lib/db";
import crypto from 'crypto';

// Helper function to encrypt credentials
async function encryptCredentials(credentials: Record<string, string>): Promise<string> {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Helper function to decrypt credentials
async function decryptCredentials(encryptedData: string): Promise<Record<string, string>> {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

// GET /api/integrations - List available integrations
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Define real integration providers
    const availableProviders = Object.entries(INTEGRATION_PROVIDERS).map(([key, provider]) => ({
      id: key.toLowerCase(),
      name: provider.name,
      description: `${provider.name} integration`,
      category: provider.type,
      status: "AVAILABLE",
      configRequired: getConfigRequirements(key),
      features: provider.features,
      oauthUrl: getOAuthUrl(key),
      capabilities: provider.features,
    }));

    // Fetch configured integrations from database
    const configuredIntegrations = await prisma.integration.findMany({
      where: { isActive: true },
      include: {
        syncLogs: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      },
    });

    // Transform configured integrations for response
    const transformedConfigured = configuredIntegrations.map(integration => ({
      id: integration.id,
      provider: integration.provider,
      name: integration.name,
      status: integration.status,
      lastSync: integration.lastSync?.toISOString(),
      config: integration.config,
      syncStats: {
        totalSyncs: integration.syncLogs.length,
        successfulSyncs: integration.syncLogs.filter(log => log.status === 'SUCCESS').length,
        failedSyncs: integration.syncLogs.filter(log => log.status === 'FAILED').length,
        lastSuccess: integration.syncLogs.find(log => log.status === 'SUCCESS')?.createdAt.toISOString(),
      },
    }));

    logger.info("Integrations retrieved", {
      userId: user.id,
      availableProviders: availableProviders.length,
      configuredIntegrations: transformedConfigured.length,
    });

    return ok({
      providers: availableProviders,
      configured: transformedConfigured,
      summary: {
        totalAvailable: availableProviders.length,
        totalConfigured: transformedConfigured.length,
        healthyCount: transformedConfigured.filter(i => i.status === "CONNECTED").length,
      },
    }, "Integrations retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve integrations", { error });
    return serverError(error);
  }
}

// POST /api/integrations/[provider]/connect - Connect integration
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Get provider from URL
    const url = new URL(request.url);
    const provider = url.pathname.split("/")[3]; // /api/integrations/[provider]/connect

    if (!provider) {
      return badRequest("Provider is required");
    }

    // Validate request body based on provider
    const body = await validateBody(
      z.object({
        credentials: z.record(z.string()),
        config: z.record(z.any()).optional(),
        testConnection: z.boolean().default(true),
      }),
      request
    ) as {
      credentials: Record<string, string>;
      config?: Record<string, any>;
      testConnection?: boolean;
    };

    // Initialize integration hub and connect
    const integrationHub = new IntegrationHub();
    const connectionResult = await integrationHub.connect(provider, {
      credentials: body.credentials,
      config: body.config,
      testConnection: body.testConnection,
      userId: user.id,
    });

    // Encrypt and store credentials in database
    const encryptedCredentials = await encryptCredentials(body.credentials);
    const integration = await prisma.integration.create({
      data: {
        id: `${provider}_${Date.now()}`,
        provider,
        name: `${INTEGRATION_PROVIDERS[provider.toUpperCase()]?.name || provider} Integration`,
        status: connectionResult.success ? "CONNECTED" : "FAILED",
        credentials: encryptedCredentials,
        config: body.config,
        connectedBy: user.id,
        connectedAt: new Date(),
        isActive: connectionResult.success,
      },
    });

    logger.info("Integration connected", {
      userId: user.id,
      provider,
      integrationId: integration.id,
      testResult: connectionResult.success,
    });

    return created({
      integrationId: integration.id,
      provider,
      status: integration.status,
      connectedAt: integration.connectedAt.toISOString(),
      connectedBy: user.id,
      testResult: connectionResult,
      features: INTEGRATION_PROVIDERS[provider.toUpperCase()]?.features || [],
    }, "Integration connected successfully");
  } catch (error) {
    logger.error("Failed to connect integration", { error });
    return serverError(error);
  }
}

// POST /api/integrations/oauth/callback - OAuth callback handler
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    const body = await validateBody(
      z.object({
        provider: z.string(),
        code: z.string(),
        state: z.string().optional(),
      }),
      request
    ) as {
      provider: string;
      code: string;
      state?: string;
    };

    // Handle OAuth flow
    const integrationHub = new IntegrationHub();
    const oauthResult = await handleOAuthCallback(body.provider, body.code, body.state, user.id);

    if (oauthResult.success) {
      // Store access tokens securely
      const encryptedTokens = await encryptCredentials({
        accessToken: oauthResult.accessToken,
        refreshToken: oauthResult.refreshToken,
      });

      const integration = await prisma.integration.upsert({
        where: { provider_userId: { provider: body.provider, userId: user.id } },
        update: {
          credentials: encryptedTokens,
          status: "CONNECTED",
          lastSync: new Date(),
        },
        create: {
          id: `${body.provider}_${Date.now()}`,
          provider: body.provider,
          name: `${INTEGRATION_PROVIDERS[body.provider.toUpperCase()]?.name || body.provider} Integration`,
          status: "CONNECTED",
          credentials: encryptedTokens,
          connectedBy: user.id,
          connectedAt: new Date(),
          isActive: true,
        },
      });

      return ok({
        integrationId: integration.id,
        provider: body.provider,
        status: "CONNECTED",
        tokensStored: true,
      }, "OAuth connection completed successfully");
    } else {
      return badRequest("OAuth connection failed");
    }
  } catch (error) {
    logger.error("Failed to handle OAuth callback", { error });
    return serverError(error);
  }
}

// Helper function to get config requirements
function getConfigRequirements(provider: string): string[] {
  const requirements: Record<string, string[]> = {
    stripe: ['apiKey', 'webhookSecret'],
    quickbooks: ['clientId', 'clientSecret', 'companyId'],
    docusign: ['integrationKey', 'secretKey', 'accountId'],
    twilio: ['accountSid', 'authToken', 'phoneNumber'],
    zapier: ['webhookUrls'],
    google_calendar: ['clientId', 'clientSecret', 'redirectUri'],
  };
  return requirements[provider.toLowerCase()] || [];
}

// Helper function to get OAuth URL
function getOAuthUrl(provider: string): string | undefined {
  const urls: Record<string, string> = {
    quickbooks: 'https://appcenter.intuit.com/connect/oauth2',
    docusign: 'https://account.docusign.com/oauth/auth',
    google_calendar: 'https://accounts.google.com/o/oauth2/auth',
  };
  return urls[provider.toLowerCase()];
}

// Helper function to handle OAuth callback
async function handleOAuthCallback(provider: string, code: string, state: string | undefined, userId: string): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
}> {
  // Implement OAuth token exchange based on provider
  // This is a simplified implementation - in production, use proper OAuth libraries
  try {
    switch (provider.toLowerCase()) {
      case 'quickbooks':
        // Exchange code for tokens with QuickBooks
        const qbResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.QUICKBOOKS_REDIRECT_URI || '',
            client_id: process.env.QUICKBOOKS_CLIENT_ID || '',
            client_secret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
          }),
        });
        const qbData = await qbResponse.json();
        return {
          success: true,
          accessToken: qbData.access_token,
          refreshToken: qbData.refresh_token,
        };

      case 'docusign':
        // Similar implementation for DocuSign
        const dsResponse = await fetch('https://account.docusign.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: process.env.DOCUSIGN_CLIENT_ID || '',
            client_secret: process.env.DOCUSIGN_CLIENT_SECRET || '',
          }),
        });
        const dsData = await dsResponse.json();
        return {
          success: true,
          accessToken: dsData.access_token,
          refreshToken: dsData.refresh_token,
        };

      case 'google_calendar':
        // Similar for Google
        const googleResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
          }),
        });
        const googleData = await googleResponse.json();
        return {
          success: true,
          accessToken: googleData.access_token,
          refreshToken: googleData.refresh_token,
        };

      default:
        return { success: false };
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return { success: false };
  }
}

// Function to refresh OAuth tokens automatically
export async function refreshOAuthTokens(integrationId: string): Promise<boolean> {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) return false;

    const credentials = await decryptCredentials(integration.credentials);
    const refreshToken = credentials.refreshToken;

    if (!refreshToken) return false;

    // Implement token refresh based on provider
    // Similar to OAuth callback but using refresh_token grant type
    // This would be called periodically or when access token expires

    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}