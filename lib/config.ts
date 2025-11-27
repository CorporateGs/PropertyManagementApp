// Application configuration management
interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  url: string;
  api: {
    baseUrl: string;
    timeout: number;
  };
  database: {
    url: string;
  };
  auth: {
    sessionMaxAge: number;
    secret: string;
  };
  ai: {
    provider: 'anthropic' | 'openai';
    model: string;
    maxTokens: number;
    temperature: number;
    rateLimit: {
      requests: number;
      windowMs: number;
    };
  };
  integrations: {
    stripe: {
      enabled: boolean;
      webhookSecret: string;
    };
    twilio: {
      enabled: boolean;
      accountSid: string;
      phoneNumber: string;
    };
    sendgrid: {
      enabled: boolean;
      apiKey: string;
    };
    quickbooks: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
    docusign: {
      enabled: boolean;
      integrationKey: string;
      secretKey: string;
    };
  };
  features: {
    aiAssistant: boolean;
    tenantScreening: boolean;
    rentOptimization: boolean;
    predictiveMaintenance: boolean;
    blockchainRecording: boolean;
    workflowAutomation: boolean;
    multiTenancy: boolean;
  };
  limits: {
    fileUpload: {
      maxSize: number; // in bytes
      allowedTypes: string[];
    };
    api: {
      rateLimit: number;
      burstLimit: number;
    };
    pagination: {
      defaultLimit: number;
      maxLimit: number;
    };
  };
  email: {
    from: string;
    templates: {
      welcome: string;
      paymentReminder: string;
      maintenanceUpdate: string;
      leaseExpiration: string;
    };
  };
  sms: {
    from: string;
    templates: {
      paymentReminder: string;
      maintenanceUpdate: string;
      appointmentReminder: string;
    };
  };
  monitoring: {
    sentry: {
      dsn: string;
      enabled: boolean;
    };
    logging: {
      level: 'debug' | 'info' | 'warn' | 'error';
      enableConsole: boolean;
      enableFile: boolean;
    };
  };
}

// Validate required environment variables
function validateEnvironment(): AppConfig['environment'] {
  const env = process.env.NODE_ENV || 'development';
  if (!['development', 'production', 'test'].includes(env)) {
    throw new Error(`Invalid NODE_ENV: ${env}`);
  }
  return env as AppConfig['environment'];
}

// Get configuration from environment variables
function getConfig(): AppConfig {
  const environment = validateEnvironment();

  return {
    name: 'Property Management CRM',
    version: process.env.npm_package_version || '1.0.0',
    environment,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    api: {
      baseUrl: '/api',
      timeout: 30000, // 30 seconds
    },
    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/property_crm_dev',
    },
    auth: {
      sessionMaxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      secret: process.env.NEXTAUTH_SECRET || 'development-secret',
    },
    ai: {
      provider: (process.env.AI_PROVIDER as 'anthropic' | 'openai') || 'anthropic',
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      rateLimit: {
        requests: parseInt(process.env.AI_RATE_LIMIT_REQUESTS || '10'),
        windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW || '60000'), // 1 minute
      },
    },
    integrations: {
      stripe: {
        enabled: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      },
      twilio: {
        enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
      },
      sendgrid: {
        enabled: !!process.env.SENDGRID_API_KEY,
        apiKey: process.env.SENDGRID_API_KEY || '',
      },
      quickbooks: {
        enabled: !!(process.env.QUICKBOOKS_CLIENT_ID && process.env.QUICKBOOKS_CLIENT_SECRET),
        clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
      },
      docusign: {
        enabled: !!(process.env.DOCUSIGN_INTEGRATION_KEY && process.env.DOCUSIGN_SECRET_KEY),
        integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || '',
        secretKey: process.env.DOCUSIGN_SECRET_KEY || '',
      },
    },
    features: {
      aiAssistant: !!process.env.ANTHROPIC_API_KEY,
      tenantScreening: !!process.env.ANTHROPIC_API_KEY,
      rentOptimization: !!process.env.ANTHROPIC_API_KEY,
      predictiveMaintenance: !!process.env.ANTHROPIC_API_KEY,
      blockchainRecording: !!(process.env.BLOCKCHAIN_SECRET && process.env.SIGNATURE_SECRET),
      workflowAutomation: true,
      multiTenancy: false, // Future feature
    },
    limits: {
      fileUpload: {
        maxSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '10485760'), // 10MB
        allowedTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
      api: {
        rateLimit: parseInt(process.env.API_RATE_LIMIT || '100'),
        burstLimit: parseInt(process.env.API_BURST_LIMIT || '10'),
      },
      pagination: {
        defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '20'),
        maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '100'),
      },
    },
    email: {
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@propertymanagement.com',
      templates: {
        welcome: 'welcome-template',
        paymentReminder: 'payment-reminder-template',
        maintenanceUpdate: 'maintenance-update-template',
        leaseExpiration: 'lease-expiration-template',
      },
    },
    sms: {
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      templates: {
        paymentReminder: 'Payment due: ${amount}. Due date: ${dueDate}',
        maintenanceUpdate: 'Maintenance update: ${title}. Status: ${status}',
        appointmentReminder: 'Reminder: ${type} scheduled for ${dateTime}',
      },
    },
    monitoring: {
      sentry: {
        dsn: process.env.SENTRY_DSN || '',
        enabled: !!process.env.SENTRY_DSN,
      },
      logging: {
        level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
        enableConsole: environment === 'development',
        enableFile: environment === 'production',
      },
    },
  };
}

// Export the configuration
export const config = getConfig();

// Export individual config sections for convenience
export const { name, version, environment, url } = config;
export const { api, database, auth, ai, integrations, features, limits, email, sms, monitoring } = config;

// Validation function to check configuration on startup
export function validateConfig(): void {
  const errors: string[] = [];

  // Check required variables
  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }

  if (!config.auth.secret || config.auth.secret === 'development-secret') {
    errors.push('NEXTAUTH_SECRET is required and should not be the default value');
  }

  if (!config.auth.secret || config.auth.secret.length < 32) {
    errors.push('NEXTAUTH_SECRET should be at least 32 characters');
  }

  // Check AI configuration
  if (config.features.aiAssistant && !config.integrations.anthropic.apiKey) {
    errors.push('ANTHROPIC_API_KEY is required for AI features');
  }

  // Check payment configuration
  if (config.integrations.stripe.enabled && !config.integrations.stripe.webhookSecret) {
    errors.push('STRIPE_WEBHOOK_SECRET is required when Stripe is enabled');
  }

  // Check communication configuration
  if (config.integrations.twilio.enabled && !config.integrations.twilio.accountSid) {
    errors.push('TWILIO_ACCOUNT_SID is required when Twilio is enabled');
  }

  if (config.integrations.sendgrid.enabled && !config.integrations.sendgrid.apiKey) {
    errors.push('SENDGRID_API_KEY is required when SendGrid is enabled');
  }

  // Check file upload limits
  if (config.limits.fileUpload.maxSize > 100 * 1024 * 1024) {
    errors.push('FILE_UPLOAD_MAX_SIZE should not exceed 100MB');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}

// Feature flags
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature];
};

// Integration checks
export const isIntegrationEnabled = (integration: keyof AppConfig['integrations']): boolean => {
  return config.integrations[integration].enabled;
};

// Environment checks
export const isDevelopment = (): boolean => config.environment === 'development';
export const isProduction = (): boolean => config.environment === 'production';
export const isTest = (): boolean => config.environment === 'test';

// Utility functions
export const getApiUrl = (path: string): string => {
  return `${config.api.baseUrl}${path}`;
};

export const getFileUploadLimit = (): number => {
  return config.limits.fileUpload.maxSize;
};

export const getAllowedFileTypes = (): string[] => {
  return config.limits.fileUpload.allowedTypes;
};

export const getPaginationDefaults = () => {
  return {
    defaultLimit: config.limits.pagination.defaultLimit,
    maxLimit: config.limits.pagination.maxLimit,
  };
};

// Export type for use in other files
export type { AppConfig };