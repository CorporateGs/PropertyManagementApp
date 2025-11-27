/**
 * Advanced AI Service Layer
 * Integrates OpenAI/Anthropic for predictive analytics, NLP, document processing
 * 
 * Features:
 * - Tenant screening & risk assessment
 * - Predictive maintenance & equipment failure detection
 * - Rent pricing optimization
 * - Lease compliance auditing
 * - Document OCR & extraction
 * - Natural language chatbot
 * - Sentiment analysis
 * - Lead scoring & conversion prediction
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';
import Anthropic from '@anthropic-ai/sdk';

// AI Model Configuration
export interface AIConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// Default configuration
const defaultConfig: AIConfig = {
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 4096,
};

/**
 * Base AI Service with common functionality
 */
abstract class BaseAIService {
  protected anthropic: Anthropic;
  protected cache: Map<string, { data: any; expiry: Date }> = new Map();
  protected rateLimitMap: Map<string, { count: number; resetTime: Date }> = new Map();

  constructor() {
    try {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });
      logger.info("AI service initialized");
    } catch (error) {
      logger.error("Failed to initialize AI service", error);
      throw new ExternalServiceError("Failed to initialize AI service");
    }
  }

  /**
   * Execute AI request with retry logic
   */
  protected async executeAIRequest(
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      retries?: number;
      cacheKey?: string;
      cacheExpiryMinutes?: number;
    } = {}
  ): Promise<any> {
    const {
      model = defaultConfig.model,
      maxTokens = defaultConfig.maxTokens,
      temperature = defaultConfig.temperature,
      retries = 3,
      cacheKey,
      cacheExpiryMinutes = 60,
    } = options;

    // Check cache first
    if (cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.debug("AI response from cache", { cacheKey });
        return cached;
      }
    }

    // Check rate limit
    await this.checkRateLimit();

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info("Executing AI request", { model, attempt, retries });
        
        const message = await this.anthropic.messages.create({
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
          temperature,
        });

        const content = message.content[0];
        if (content.type === 'text') {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            // Store in cache
            if (cacheKey) {
              this.setCache(cacheKey, result, cacheExpiryMinutes);
            }
            
            // Store in database
            await this.storeAIResult(cacheKey || 'unknown', result, model);
            
            logger.info("AI request successful", { model, attempt });
            return result;
          }
        }
        
        throw new Error('Failed to parse AI response');
      } catch (error) {
        lastError = error as Error;
        logger.warn(`AI request attempt ${attempt} failed`, { error: lastError.message, model });
        
        // If not the last attempt, wait before retrying
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    logger.error("AI request failed after all retries", { error: lastError?.message, model });
    throw new ExternalServiceError(`AI request failed: ${lastError?.message}`);
  }

  /**
   * Get value from cache if not expired
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > new Date()) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set value in cache with expiry
   */
  private setCache(key: string, data: any, expiryMinutes: number): void {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
    this.cache.set(key, { data, expiry });
  }

  /**
   * Check rate limit and wait if necessary
   */
  private async checkRateLimit(): Promise<void> {
    const key = 'anthropic-api';
    const now = new Date();
    const rateLimit = this.rateLimitMap.get(key);
    
    if (!rateLimit || rateLimit.resetTime < now) {
      // Reset rate limit
      this.rateLimitMap.set(key, { count: 1, resetTime: new Date(now.getTime() + 60000) });
      return;
    }
    
    if (rateLimit.count >= 50) { // 50 requests per minute
      const waitTime = rateLimit.resetTime.getTime() - now.getTime();
      if (waitTime > 0) {
        logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.rateLimitMap.set(key, { count: 1, resetTime: new Date(now.getTime() + 60000) });
    } else {
      rateLimit.count++;
    }
  }

  /**
   * Store AI result in database
   */
  private async storeAIResult(requestKey: string, result: any, model: string): Promise<void> {
    try {
      await prisma.aIResult.create({
        data: {
          requestKey,
          result: JSON.stringify(result),
          model,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      logger.error("Failed to store AI result in database", error);
      // Don't throw here as it's not critical for the main functionality
    }
  }
}

/**
 * Tenant Screening AI Service
 */
export class TenantScreeningAI extends BaseAIService {

  /**
   * Analyze applicant and calculate risk score
   */
  async analyzeApplicant(applicantData: {
    creditScore?: number;
    monthlyIncome: number;
    rentAmount: number;
    employmentStatus: string;
    employmentDuration?: number;
    evictionHistory?: string;
    criminalHistory?: string;
    rentalHistory?: string;
  }): Promise<{
    riskScore: number;
    recommendation: 'APPROVE' | 'REJECT' | 'REVIEW' | 'REQUEST_MORE_INFO';
    confidence: number;
    reasoning: string;
    redFlags: string[];
    strengths: string[];
  }> {
    try {
      logger.info("Analyzing tenant applicant", {
        creditScore: applicantData.creditScore,
        monthlyIncome: applicantData.monthlyIncome,
        rentAmount: applicantData.rentAmount
      });

      const prompt = `As a property management expert, analyze this rental application and provide a comprehensive risk assessment:

Applicant Details:
- Credit Score: ${applicantData.creditScore || 'Not provided'}
- Monthly Income: $${applicantData.monthlyIncome}
- Requested Rent: $${applicantData.rentAmount}
- Rent-to-Income Ratio: ${((applicantData.rentAmount / applicantData.monthlyIncome) * 100).toFixed(1)}%
- Employment Status: ${applicantData.employmentStatus}
- Employment Duration: ${applicantData.employmentDuration || 'Not provided'} months
- Eviction History: ${applicantData.evictionHistory || 'None reported'}
- Criminal History: ${applicantData.criminalHistory || 'None reported'}
- Rental History: ${applicantData.rentalHistory || 'Not provided'}

Please provide:
1. Overall risk score (0-100, where 0 is lowest risk)
2. Recommendation (APPROVE/REJECT/REVIEW/REQUEST_MORE_INFO)
3. Confidence level (0-1)
4. Detailed reasoning
5. Red flags (if any)
6. Strengths

Respond in JSON format:
{
  "riskScore": number,
  "recommendation": string,
  "confidence": number,
  "reasoning": string,
  "redFlags": string[],
  "strengths": string[]
}`;

      // Create cache key from applicant data
      const cacheKey = `tenant-screening-${JSON.stringify(applicantData)}`;
      
      const result = await this.executeAIRequest(prompt, {
        cacheKey,
        cacheExpiryMinutes: 120, // Cache for 2 hours
      });

      // Store screening result in database
      await prisma.tenantScreening.create({
        data: {
          applicantData: JSON.stringify(applicantData),
          result: JSON.stringify(result),
          createdAt: new Date(),
        },
      });

      logger.info("Tenant applicant analysis completed", {
        riskScore: result.riskScore,
        recommendation: result.recommendation
      });

      return result;
    } catch (error) {
      logger.error("Failed to analyze tenant applicant", error);
      throw new ExternalServiceError("Failed to analyze tenant applicant");
    }
  }

  /**
   * Detect fraud patterns using biometric and document analysis
   */
  async detectFraud(data: {
    documentsProvided: string[];
    biometricMatches?: boolean;
    applicationSpeed?: number; // seconds to complete
    ipAddress?: string;
    deviceFingerprint?: string;
  }): Promise<{
    fraudScore: number;
    isSuspicious: boolean;
    reasons: string[];
    recommendations: string[];
  }> {
    // Implement fraud detection logic
    const fraudIndicators: string[] = [];
    let fraudScore = 0;

    // Check application completion speed (too fast might be bot/copy-paste)
    if (data.applicationSpeed && data.applicationSpeed < 120) {
      fraudIndicators.push('Application completed suspiciously fast');
      fraudScore += 25;
    }

    // Check biometric verification
    if (data.biometricMatches === false) {
      fraudIndicators.push('Biometric verification failed');
      fraudScore += 40;
    }

    // Check document consistency
    if (data.documentsProvided.length < 2) {
      fraudIndicators.push('Insufficient documentation provided');
      fraudScore += 15;
    }

    return {
      fraudScore: Math.min(fraudScore, 100),
      isSuspicious: fraudScore > 50,
      reasons: fraudIndicators,
      recommendations: fraudScore > 50 
        ? ['Request additional verification', 'Manual review required', 'Consider video interview']
        : ['Standard processing approved'],
    };
  }
}

/**
 * Predictive Maintenance AI Service
 */
export class PredictiveMaintenanceAI {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Predict equipment failure probability
   */
  async predictEquipmentFailure(equipmentData: {
    type: string;
    installationDate: Date;
    lastServiceDate?: Date;
    manufacturer?: string;
    model?: string;
    recentReadings?: Array<{
      metricType: string;
      value: number;
      unit: string;
      timestamp: Date;
    }>;
    maintenanceHistory?: Array<{
      date: Date;
      type: string;
      cost: number;
    }>;
  }): Promise<{
    failureProbability: number; // 0-1
    expectedFailureDate?: Date;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendedActions: string[];
    estimatedCost: number;
    reasoning: string;
  }> {
    const age = Math.floor(
      (Date.now() - equipmentData.installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );

    const daysSinceService = equipmentData.lastServiceDate
      ? Math.floor((Date.now() - equipmentData.lastServiceDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const prompt = `As a predictive maintenance expert, analyze this equipment and predict failure probability:

Equipment Details:
- Type: ${equipmentData.type}
- Age: ${age} years
- Days Since Last Service: ${daysSinceService || 'Never serviced'}
- Manufacturer: ${equipmentData.manufacturer || 'Unknown'}
- Model: ${equipmentData.model || 'Unknown'}

Recent IoT Readings:
${equipmentData.recentReadings?.map(r => 
  `- ${r.metricType}: ${r.value} ${r.unit} (${r.timestamp.toISOString()})`
).join('\n') || 'No recent readings available'}

Maintenance History:
${equipmentData.maintenanceHistory?.map(m => 
  `- ${m.date.toISOString()}: ${m.type} ($${m.cost})`
).join('\n') || 'No maintenance history'}

Provide:
1. Failure probability (0-1)
2. Expected failure date (if applicable)
3. Urgency level
4. Recommended preventive actions
5. Estimated maintenance/replacement cost
6. Detailed reasoning

Respond in JSON format:
{
  "failureProbability": number,
  "expectedFailureDate": "ISO date string or null",
  "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommendedActions": string[],
  "estimatedCost": number,
  "reasoning": string
}`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (result.expectedFailureDate) {
          result.expectedFailureDate = new Date(result.expectedFailureDate);
        }
        return result;
      }
    }

    throw new Error('Failed to parse AI response');
  }

  /**
   * Estimate maintenance cost and duration
   */
  async estimateMaintenanceCost(request: {
    category: string;
    description: string;
    priority: string;
    unitType?: string;
    location?: string;
    photos?: string[];
  }): Promise<{
    estimatedCost: { min: number; max: number; average: number };
    estimatedDuration: { min: number; max: number; unit: 'hours' | 'days' };
    recommendedVendorType: string;
    urgencyAssessment: string;
    costBreakdown: Array<{ item: string; cost: number }>;
  }> {
    const prompt = `As a maintenance cost estimation expert, analyze this maintenance request:

Category: ${request.category}
Description: ${request.description}
Priority: ${request.priority}
Unit Type: ${request.unitType || 'Standard'}
Location: ${request.location || 'Not specified'}
Photos: ${request.photos?.length || 0} attached

Provide:
1. Cost estimate (min, max, average in USD)
2. Duration estimate (min, max in hours or days)
3. Recommended vendor type
4. Urgency assessment
5. Cost breakdown by item/labor

Respond in JSON format:
{
  "estimatedCost": {
    "min": number,
    "max": number,
    "average": number
  },
  "estimatedDuration": {
    "min": number,
    "max": number,
    "unit": "hours" | "days"
  },
  "recommendedVendorType": string,
  "urgencyAssessment": string,
  "costBreakdown": [{ "item": string, "cost": number }]
}`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }
}

/**
 * Rent Pricing Optimization AI
 */
export class RentPricingAI {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Calculate optimal rent price based on market data
   */
  async calculateOptimalRent(propertyData: {
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    location: { city: string; state: string; zipCode: string };
    amenities: string[];
    condition: string;
    yearBuilt?: number;
    lastRenovated?: Date;
    currentRent?: number;
    occupancyHistory?: Array<{ date: Date; occupied: boolean }>;
    competitorRents?: Array<{ rent: number; bedrooms: number; distance: number }>;
  }): Promise<{
    recommendedRent: number;
    confidenceLevel: number;
    priceRange: { min: number; max: number };
    marketPosition: 'BELOW_MARKET' | 'AT_MARKET' | 'ABOVE_MARKET' | 'PREMIUM';
    reasoning: string;
    demandForecast: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
    seasonalAdjustment: string;
    recommendations: string[];
  }> {
    const prompt = `As a real estate pricing expert, calculate the optimal rent for this property:

Property Details:
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Square Feet: ${propertyData.squareFeet}
- Location: ${propertyData.location.city}, ${propertyData.location.state} ${propertyData.location.zipCode}
- Amenities: ${propertyData.amenities.join(', ')}
- Condition: ${propertyData.condition}
- Year Built: ${propertyData.yearBuilt || 'Unknown'}
- Last Renovated: ${propertyData.lastRenovated?.toISOString() || 'Unknown'}
- Current Rent: $${propertyData.currentRent || 'Not set'}

Competitor Data:
${propertyData.competitorRents?.map(c => 
  `- ${c.bedrooms}BR: $${c.rent}/month (${c.distance} miles away)`
).join('\n') || 'No competitor data available'}

Provide:
1. Recommended monthly rent
2. Confidence level (0-1)
3. Price range (min-max)
4. Market position assessment
5. Detailed reasoning
6. Demand forecast
7. Seasonal adjustment notes
8. Pricing recommendations

Respond in JSON format with all fields.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }
}

/**
 * Lease Compliance & Audit AI
 */
export class LeaseComplianceAI {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Audit lease document for legal compliance
   */
  async auditLease(leaseData: {
    leaseText: string;
    state: string;
    leaseType: string;
    specialClauses?: string;
  }): Promise<{
    complianceScore: number; // 0-100
    status: 'COMPLIANT' | 'MINOR_ISSUES' | 'MAJOR_ISSUES' | 'NON_COMPLIANT';
    issues: Array<{
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      clause: string;
      issue: string;
      recommendation: string;
      legalReference?: string;
    }>;
    missingClauses: string[];
    recommendations: string[];
    fairHousingCompliance: boolean;
    stateSpecificRequirements: string[];
  }> {
    const prompt = `As a legal compliance expert specializing in ${leaseData.state} property law, audit this lease for compliance:

Lease Type: ${leaseData.leaseType}
State: ${leaseData.state}

Lease Content:
${leaseData.leaseText}

Special Clauses:
${leaseData.specialClauses || 'None'}

Analyze for:
1. Fair Housing Act compliance
2. State-specific requirements for ${leaseData.state}
3. Required disclosures (lead paint, mold, etc.)
4. Prohibited clauses
5. Missing essential terms
6. Ambiguous language
7. Security deposit regulations
8. Notice period requirements
9. Entry rights
10. Termination clauses

Provide comprehensive audit report in JSON format with all fields specified.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }
}

/**
 * Document Processing AI
 */
export class DocumentProcessingAI {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Extract data from documents using OCR and NLP
   */
  async extractDocumentData(document: {
    type: 'LEASE' | 'APPLICATION' | 'INVOICE' | 'ID' | 'PAYSTUB' | 'OTHER';
    content: string; // OCR'd text or base64 image
    fileName: string;
  }): Promise<{
    extractedData: Record<string, any>;
    confidence: number;
    documentType: string;
    validationErrors: string[];
    structuredData: any;
  }> {
    const prompt = `Extract structured data from this ${document.type} document:

Document: ${document.fileName}

Content:
${document.content}

Extract all relevant information and return in structured JSON format appropriate for the document type.
Include confidence scores for each extracted field.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }

  /**
   * Generate property descriptions for marketing
   */
  async generatePropertyDescription(propertyData: {
    type: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    amenities: string[];
    location: string;
    highlights: string[];
    tone?: 'PROFESSIONAL' | 'CASUAL' | 'LUXURY' | 'BUDGET_FRIENDLY';
  }): Promise<{
    shortDescription: string; // For listings
    longDescription: string; // For details page
    seoDescription: string; // For search engines
    socialMediaCaptions: {
      facebook: string;
      instagram: string;
      twitter: string;
    };
    keywords: string[];
  }> {
    const tone = propertyData.tone || 'PROFESSIONAL';
    
    const prompt = `Generate compelling marketing descriptions for this property:

Property Details:
- Type: ${propertyData.type}
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Square Feet: ${propertyData.squareFeet}
- Location: ${propertyData.location}
- Amenities: ${propertyData.amenities.join(', ')}
- Highlights: ${propertyData.highlights.join(', ')}
- Desired Tone: ${tone}

Generate:
1. Short description (50-80 words) for listings
2. Long description (150-250 words) for detail pages
3. SEO-optimized meta description (150-160 characters)
4. Social media captions for Facebook, Instagram, Twitter
5. SEO keywords list

Respond in JSON format with all specified fields.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }
}

/**
 * Conversational AI Chatbot
 */
export class PropertyManagementChatbot {
  private anthropic: Anthropic;
  private conversationHistory: Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
    this.conversationHistory = new Map();
  }

  /**
   * Process user message and generate intelligent response
   */
  async chat(params: {
    conversationId: string;
    message: string;
    userType: 'TENANT' | 'MANAGER' | 'OWNER';
    context?: {
      tenantId?: string;
      buildingId?: string;
      userId?: string;
    };
  }): Promise<{
    response: string;
    intent: string; // e.g., 'MAINTENANCE_REQUEST', 'PAYMENT_INQUIRY', 'GENERAL_QUESTION'
    confidence: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    suggestedActions?: Array<{
      action: string;
      label: string;
      data?: any;
    }>;
    requiresHumanEscalation: boolean;
  }> {
    // Get conversation history
    const history = this.conversationHistory.get(params.conversationId) || [];
    
    const systemPrompt = `You are an intelligent property management assistant. You help ${params.userType.toLowerCase()}s with their questions and tasks related to property management.

Your capabilities include:
- Answering questions about leases, payments, and policies
- Helping create maintenance requests
- Providing property information
- Scheduling appointments
- Payment assistance
- General property management support

Always be helpful, professional, and concise. If you're unsure or the request requires human intervention, say so clearly.`;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history,
      { role: 'user', content: params.message },
    ];

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages as any,
    });

    const responseContent = message.content[0];
    const responseText = responseContent.type === 'text' ? responseContent.text : '';

    // Store conversation history
    history.push({ role: 'user', content: params.message });
    history.push({ role: 'assistant', content: responseText });
    this.conversationHistory.set(params.conversationId, history);

    // Analyze intent and sentiment
    const intent = await this.detectIntent(params.message);
    const sentiment = await this.analyzeSentiment(params.message);

    return {
      response: responseText,
      intent: intent.intent,
      confidence: intent.confidence,
      sentiment: sentiment,
      suggestedActions: this.getSuggestedActions(intent.intent),
      requiresHumanEscalation: intent.confidence < 0.7 || sentiment === 'NEGATIVE',
    };
  }

  private async detectIntent(message: string): Promise<{ intent: string; confidence: number }> {
    // Simple intent detection logic
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair') || lowerMessage.includes('broken')) {
      return { intent: 'MAINTENANCE_REQUEST', confidence: 0.9 };
    }
    if (lowerMessage.includes('pay') || lowerMessage.includes('rent') || lowerMessage.includes('invoice')) {
      return { intent: 'PAYMENT_INQUIRY', confidence: 0.9 };
    }
    if (lowerMessage.includes('lease') || lowerMessage.includes('contract') || lowerMessage.includes('renewal')) {
      return { intent: 'LEASE_INQUIRY', confidence: 0.9 };
    }
    if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('showing')) {
      return { intent: 'SCHEDULING', confidence: 0.8 };
    }

    return { intent: 'GENERAL_QUESTION', confidence: 0.6 };
  }

  private async analyzeSentiment(message: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
    const lowerMessage = message.toLowerCase();
    
    const negativeWords = ['angry', 'frustrated', 'terrible', 'awful', 'disappointed', 'unhappy', 'complaint'];
    const positiveWords = ['thank', 'great', 'excellent', 'wonderful', 'appreciate', 'happy', 'satisfied'];
    
    const hasNegative = negativeWords.some(word => lowerMessage.includes(word));
    const hasPositive = positiveWords.some(word => lowerMessage.includes(word));
    
    if (hasNegative) return 'NEGATIVE';
    if (hasPositive) return 'POSITIVE';
    return 'NEUTRAL';
  }

  private getSuggestedActions(intent: string): Array<{ action: string; label: string; data?: any }> {
    switch (intent) {
      case 'MAINTENANCE_REQUEST':
        return [
          { action: 'CREATE_MAINTENANCE_REQUEST', label: 'Create Maintenance Request' },
          { action: 'VIEW_MAINTENANCE_HISTORY', label: 'View Past Requests' },
        ];
      case 'PAYMENT_INQUIRY':
        return [
          { action: 'VIEW_PAYMENT_HISTORY', label: 'View Payments' },
          { action: 'MAKE_PAYMENT', label: 'Pay Now' },
        ];
      case 'LEASE_INQUIRY':
        return [
          { action: 'VIEW_LEASE', label: 'View Lease Document' },
          { action: 'REQUEST_RENEWAL', label: 'Request Renewal' },
        ];
      case 'SCHEDULING':
        return [
          { action: 'SCHEDULE_APPOINTMENT', label: 'Schedule Appointment' },
        ];
      default:
        return [];
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }
}

/**
 * Lead Scoring AI
 */
export class LeadScoringAI {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Score and prioritize leads
   */
  async scoreLead(leadData: {
    source: string;
    budget?: number;
    moveInDate?: Date;
    responseTime?: number; // minutes to respond to inquiry
    engagementHistory: Array<{
      type: string;
      timestamp: Date;
    }>;
    demographics?: {
      age?: number;
      employmentStatus?: string;
      creditScore?: number;
    };
  }): Promise<{
    score: number; // 0-100
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    conversionProbability: number; // 0-1
    recommendedFollowUp: {
      timing: string;
      method: 'EMAIL' | 'PHONE' | 'TEXT' | 'IN_PERSON';
      message: string;
    };
    reasoning: string;
  }> {
    let score = 50; // Base score

    // Adjust based on source quality
    const sourceScores: Record<string, number> = {
      'REFERRAL': 20,
      'WEBSITE': 15,
      'WALK_IN': 10,
      'PHONE_CALL': 10,
      'ZILLOW': 5,
      'APARTMENTS_COM': 5,
      'CRAIGSLIST': 0,
      'SOCIAL_MEDIA': 5,
    };
    score += sourceScores[leadData.source] || 0;

    // Adjust for budget alignment
    if (leadData.budget) {
      score += 10; // Has clear budget
    }

    // Adjust for move-in urgency
    if (leadData.moveInDate) {
      const daysUntilMove = Math.floor(
        (leadData.moveInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilMove < 30) score += 15;
      else if (daysUntilMove < 60) score += 10;
      else if (daysUntilMove < 90) score += 5;
    }

    // Adjust for engagement
    score += Math.min(leadData.engagementHistory.length * 5, 25);

    // Adjust for demographics
    if (leadData.demographics) {
      if (leadData.demographics.creditScore && leadData.demographics.creditScore > 700) {
        score += 10;
      }
      if (leadData.demographics.employmentStatus === 'EMPLOYED') {
        score += 5;
      }
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine priority
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    if (score >= 80) priority = 'URGENT';
    else if (score >= 65) priority = 'HIGH';
    else if (score >= 45) priority = 'MEDIUM';
    else priority = 'LOW';

    // Calculate conversion probability
    const conversionProbability = score / 100;

    // Recommend follow-up
    const recommendedFollowUp = this.getFollowUpRecommendation(score, leadData.source);

    return {
      score,
      priority,
      conversionProbability,
      recommendedFollowUp,
      reasoning: `Lead scored ${score}/100 based on source quality, urgency, engagement, and qualifications.`,
    };
  }

  private getFollowUpRecommendation(score: number, source: string): {
    timing: string;
    method: 'EMAIL' | 'PHONE' | 'TEXT' | 'IN_PERSON';
    message: string;
  } {
    if (score >= 80) {
      return {
        timing: 'Within 15 minutes',
        method: 'PHONE',
        message: 'Immediate personal call to secure interest',
      };
    } else if (score >= 65) {
      return {
        timing: 'Within 1 hour',
        method: 'PHONE',
        message: 'Prompt call to discuss availability',
      };
    } else if (score >= 45) {
      return {
        timing: 'Within 4 hours',
        method: 'EMAIL',
        message: 'Email with property details and scheduling options',
      };
    } else {
      return {
        timing: 'Within 24 hours',
        method: 'EMAIL',
        message: 'Automated email with general information',
      };
    }
  }
}

/**
 * Export all AI services
 */
export const AIServices = {
  TenantScreeningAI,
  PredictiveMaintenanceAI,
  RentPricingAI,
  LeaseComplianceAI,
  DocumentProcessingAI,
  PropertyManagementChatbot,
  LeadScoringAI,
};

export default AIServices;

