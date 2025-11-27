

export const APP_NAME = 'PropertyHub Pro';
export const APP_DESCRIPTION = 'AI-Powered Enterprise Property Management Platform';

export const ROUTES = {
  DASHBOARD: '/',
  TENANTS: '/tenants',
  UNITS: '/units',
  PAYMENTS: '/payments',
  COMMUNICATIONS: '/communications',
  MAINTENANCE: '/maintenance',
  REPORTS: '/reports',
  USERS: '/users',
  DOCUMENTS: '/documents',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LEASES: '/leases',
  SCREENING: '/screening',
  MARKETING: '/marketing',
  ACCOUNTING: '/accounting',
  INSPECTIONS: '/inspections',
  VENDORS: '/vendors',
  ANALYTICS: '/analytics',
  AI_ASSISTANT: '/ai-assistant',
  TENANT_PORTAL: '/tenant-portal',
  OWNER_PORTAL: '/owner-portal',
} as const;

export const UNIT_STATUS_COLORS = {
  VACANT: 'bg-yellow-100 text-yellow-800',
  OCCUPIED: 'bg-green-100 text-green-800',
  MAINTENANCE: 'bg-red-100 text-red-800',
  UNAVAILABLE: 'bg-gray-100 text-gray-800',
  NOTICE_GIVEN: 'bg-orange-100 text-orange-800',
  MODEL_UNIT: 'bg-blue-100 text-blue-800',
};

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  LATE: 'bg-red-100 text-red-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
};

export const PRIORITY_COLORS = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  EMERGENCY: 'bg-red-100 text-red-800',
};

export const MAINTENANCE_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  VENDOR_ASSIGNED: 'bg-teal-100 text-teal-800',
};

export const COMMUNICATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FOLLOW_UP_REQUIRED: 'bg-orange-100 text-orange-800',
  ESCALATED: 'bg-red-100 text-red-800',
};

export const LEASE_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  TERMINATED: 'bg-gray-100 text-gray-800',
  RENEWAL_PENDING: 'bg-blue-100 text-blue-800',
  NOTICE_GIVEN: 'bg-orange-100 text-orange-800',
};

export const APPLICATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
  SCREENING: 'bg-blue-100 text-blue-800',
  INCOMPLETE: 'bg-gray-100 text-gray-800',
  HOLD: 'bg-purple-100 text-purple-800',
};

export const VENDOR_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export const INSPECTION_STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  RESCHEDULED: 'bg-purple-100 text-purple-800',
};

// AI Assistant Features
export const AI_FEATURES = {
  TENANT_SCREENING: 'Automated tenant screening with AI risk assessment',
  RENT_OPTIMIZATION: 'AI-powered rent pricing recommendations',
  MAINTENANCE_PREDICTION: 'Predictive maintenance using IoT sensors',
  COMMUNICATION_AUTO: 'Automated tenant communication and follow-ups',
  LEASE_ANALYSIS: 'AI lease term optimization and renewal predictions',
  MARKET_ANALYSIS: 'Real-time market analysis and pricing insights',
  FINANCIAL_FORECASTING: 'AI-powered cash flow and financial forecasting',
  ENERGY_OPTIMIZATION: 'Smart building energy management',
};

// Advanced Features from Top CRMs
export const ADVANCED_FEATURES = {
  VIRTUAL_TOURS: 'VR/AR property tours',
  SMART_LOCKS: 'IoT smart lock integration',
  ENERGY_MONITORING: 'Real-time energy usage tracking',
  AUTOMATED_MARKETING: 'AI-powered property marketing',
  PREDICTIVE_ANALYTICS: 'Predictive analytics dashboard',
  MOBILE_INSPECTIONS: 'Mobile inspection app with photo recognition',
  TENANT_SENTIMENT: 'AI tenant sentiment analysis',
  AUTOMATED_RENEWALS: 'Smart lease renewal automation',
  COMPLIANCE_TRACKING: 'Automated compliance monitoring',
  OWNER_REPORTING: 'Automated owner financial reporting',
};

export const NOTIFICATION_TYPES = {
  PAYMENT_DUE: 'Payment due reminder',
  LATE_PAYMENT: 'Late payment notice',
  LEASE_EXPIRING: 'Lease expiration alert',
  MAINTENANCE_REQUEST: 'Maintenance request submitted',
  MAINTENANCE_COMPLETED: 'Maintenance work completed',
  APPLICATION_RECEIVED: 'New application received',
  INSPECTION_DUE: 'Property inspection due',
  COMPLIANCE_ALERT: 'Compliance deadline alert',
  EMERGENCY_MAINTENANCE: 'Emergency maintenance request',
  RENT_INCREASE_NOTICE: 'Rent increase notice',
};

export const REPORT_TYPES = {
  FINANCIAL: {
    RENT_ROLL: 'Rent Roll Report',
    CASH_FLOW: 'Cash Flow Statement',
    P_AND_L: 'Profit & Loss Statement',
    BUDGET_VARIANCE: 'Budget vs Actual',
    TAX_SUMMARY: 'Tax Summary Report',
    OWNER_STATEMENTS: 'Owner Statement Reports',
  },
  OPERATIONAL: {
    OCCUPANCY: 'Occupancy Report',
    MAINTENANCE: 'Maintenance Summary',
    TENANT_SATISFACTION: 'Tenant Satisfaction Report',
    LEASE_EXPIRATIONS: 'Lease Expiration Report',
    VENDOR_PERFORMANCE: 'Vendor Performance Report',
    INSPECTION_SUMMARY: 'Inspection Summary Report',
  },
  ANALYTICS: {
    MARKET_ANALYSIS: 'Market Analysis Report',
    PERFORMANCE_METRICS: 'Property Performance Metrics',
    PREDICTIVE_INSIGHTS: 'AI Predictive Insights',
    ENERGY_EFFICIENCY: 'Energy Efficiency Report',
    COMPETITIVE_ANALYSIS: 'Competitive Market Analysis',
  },
};

// Integration APIs
export const INTEGRATIONS = {
  PAYMENT_PROCESSORS: ['Stripe', 'PayPal', 'ACH Direct', 'Dwolla'],
  BACKGROUND_CHECK: ['TransUnion', 'Experian', 'RentSpree Screening'],
  ACCOUNTING: ['QuickBooks', 'Xero', 'Sage', 'FreshBooks'],
  MARKETING: ['Zillow', 'Apartments.com', 'Craigslist', 'Facebook'],
  COMMUNICATION: ['Twilio', 'SendGrid', 'Mailgun', 'Slack'],
  IOT_SENSORS: ['Nest', 'Ecobee', 'SmartThings', 'Philips Hue'],
};

