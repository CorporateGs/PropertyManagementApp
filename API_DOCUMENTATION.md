# 🚀 Property Management System API Documentation

## 📋 **Overview**

This document provides comprehensive API documentation for the **God-Tier Property Management System**. All endpoints are RESTful and return JSON responses.

---

## 🔐 **Authentication**

All API endpoints require authentication via JWT tokens in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### **User Roles**
- `ADMIN` - Full system access
- `STAFF` - Property management access
- `OWNER` - Property owner access
- `TENANT` - Tenant portal access

---

## 📊 **Core API Endpoints**

### **1. Dashboard Analytics**

#### **GET /api/analytics/dashboard**
Get real-time dashboard data with customizable widgets.

**Query Parameters:**
- `buildingId` (optional) - Filter by building
- `userId` (required) - User ID
- `widgets` (optional) - Comma-separated widget names

**Response:**
```json
{
  "success": true,
  "data": {
    "occupancy": {
      "current": 95.5,
      "trend": 2.3,
      "target": 95
    },
    "revenue": {
      "current": 125000,
      "trend": 8.5,
      "target": 130000
    },
    "expenses": {
      "current": 45000,
      "trend": -2.1,
      "budget": 50000
    },
    "maintenance": {
      "pending": 12,
      "completed": 45,
      "overdue": 3
    },
    "tenants": {
      "total": 150,
      "new": 8,
      "leaving": 2
    },
    "alerts": [
      {
        "type": "MAINTENANCE",
        "message": "3 maintenance requests are overdue",
        "priority": "HIGH"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **2. Energy Management**

#### **GET /api/energy/consumption**
Get energy consumption analytics and trends.

**Query Parameters:**
- `buildingId` (optional) - Filter by building
- `unitId` (optional) - Filter by unit
- `energyType` (optional) - Filter by energy type
- `startDate` (required) - Start date (ISO string)
- `endDate` (required) - End date (ISO string)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConsumption": 1250.5,
    "totalCost": 1875.75,
    "averageDaily": 41.68,
    "trend": 5.2,
    "peakUsage": {
      "date": "2024-01-10T14:30:00Z",
      "amount": 85.2
    },
    "efficiency": 87.5,
    "comparison": {
      "previous": 1180.3,
      "change": 5.9
    }
  }
}
```

#### **POST /api/energy/consumption**
Record new energy consumption data.

**Request Body:**
```json
{
  "buildingId": "building_123",
  "unitId": "unit_456",
  "energyType": "ELECTRICITY",
  "amount": 125.5,
  "unit": "kWh",
  "cost": 18.83,
  "readingDate": "2024-01-15T10:30:00Z",
  "meterReading": 12345,
  "provider": "PG_E"
}
```

### **3. Document Management**

#### **POST /api/documents/upload**
Upload and process documents with OCR.

**Request:** Multipart form data
- `file` - Document file
- `buildingId` - Building ID
- `unitId` (optional) - Unit ID
- `tenantId` (optional) - Tenant ID
- `documentType` - Document type
- `description` (optional) - Document description
- `tags` (optional) - Comma-separated tags
- `uploadedBy` - User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc_789",
    "extractedText": "Lease agreement for Unit 101...",
    "metadata": {
      "confidence": 0.95,
      "language": "en",
      "wordCount": 1250,
      "lineCount": 45
    }
  },
  "message": "Document uploaded and processed successfully"
}
```

#### **GET /api/documents/search**
Search documents with advanced filters.

**Query Parameters:**
- `buildingId` (optional) - Filter by building
- `unitId` (optional) - Filter by unit
- `tenantId` (optional) - Filter by tenant
- `documentType` (optional) - Filter by type
- `status` (optional) - Filter by status
- `tags` (optional) - Filter by tags
- `searchText` (optional) - Full-text search
- `startDate` (optional) - Filter by date range
- `endDate` (optional) - Filter by date range
- `limit` (optional) - Results per page (default: 50)
- `offset` (optional) - Pagination offset

#### **GET /api/uploads/[id]**
Get document details and download URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_789",
    "fileName": "lease_agreement.pdf",
    "filePath": "/uploads/documents/1234567890_lease_agreement.pdf",
    "mimeType": "application/pdf",
    "fileSize": 245760,
    "status": "SIGNED",
    "version": 1,
    "extractedText": "Lease agreement for Unit 101...",
    "metadata": {
      "confidence": 0.95,
      "language": "en"
    },
    "signatures": [
      {
        "signerId": "user_123",
        "signerName": "John Doe",
        "status": "SIGNED",
        "signedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "downloadUrl": "https://app.example.com/api/download/doc_789?token=abc123",
    "canEdit": true,
    "canDelete": true
  }
}
```

#### **PUT /api/uploads/[id]**
Update document metadata.

**Request Body:**
```json
{
  "description": "Updated lease agreement",
  "tags": ["lease", "unit101", "2024"]
}
```

#### **DELETE /api/uploads/[id]**
Delete document (soft delete).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_789",
    "deletedAt": "2024-01-15T10:30:00Z",
    "deletedBy": "user_123"
  },
  "message": "Document deleted successfully"
}
```

### **4. AI Services**

#### **POST /api/ai/tenant-screening**
Analyze tenant application with AI.

**Request Body:**
```json
{
  "applicantData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "income": 75000,
    "employment": "Software Engineer",
    "references": ["ref1", "ref2"],
    "documents": ["doc1", "doc2"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "recommendation": "APPROVE",
    "riskFactors": [],
    "strengths": [
      "Stable employment",
      "Good income-to-rent ratio",
      "Positive references"
    ],
    "fraudDetection": {
      "isFraudulent": false,
      "confidence": 0.95,
      "reasons": []
    }
  }
}
```

#### **POST /api/ai/predictive-maintenance**
Get maintenance predictions for equipment.

**Request Body:**
```json
{
  "buildingId": "building_123",
  "equipmentId": "equipment_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "equipmentId": "equipment_456",
        "equipmentName": "HVAC Unit 1",
        "failureProbability": 0.75,
        "estimatedCost": 2500,
        "recommendedAction": "Replace",
        "timeframe": "Immediate"
      }
    ]
  }
}
```

### **5. Financial Management**

#### **GET /api/financial/profit-loss**
Generate profit and loss statement.

**Query Parameters:**
- `buildingId` (optional) - Filter by building
- `startDate` (required) - Start date
- `endDate` (required) - End date
- `format` (optional) - Response format (json, pdf, excel)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "revenue": {
      "rental_income": 125000,
      "parking_fees": 5000,
      "pet_fees": 2000,
      "total_revenue": 132000
    },
    "expenses": {
      "maintenance": 15000,
      "utilities": 8000,
      "insurance": 3000,
      "total_expenses": 26000
    },
    "netIncome": 106000,
    "margins": {
      "grossMargin": 0.80,
      "netMargin": 0.80
    }
  }
}
```

### **6. Communication**

#### **POST /api/communication/send-email**
Send email notification.

**Request Body:**
```json
{
  "to": "tenant@example.com",
  "subject": "Rent Reminder",
  "body": "Your rent is due in 3 days.",
  "templateId": "rent_reminder_template",
  "variables": {
    "tenantName": "John Doe",
    "amount": 1500,
    "dueDate": "2024-01-20"
  }
}
```

#### **POST /api/communication/send-sms**
Send SMS notification.

**Request Body:**
```json
{
  "to": "+1234567890",
  "body": "Your maintenance request has been completed.",
  "templateId": "maintenance_complete_template"
}
```

### **7. Workflow Automation**

#### **POST /api/workflows/create**
Create new automated workflow.

**Request Body:**
```json
{
  "name": "Late Payment Workflow",
  "description": "Automated workflow for late payments",
  "triggers": [
    {
      "type": "PAYMENT_OVERDUE",
      "conditions": {
        "daysOverdue": 3
      }
    }
  ],
  "actions": [
    {
      "type": "SEND_EMAIL",
      "config": {
        "templateId": "late_payment_template",
        "to": "{{tenant.email}}"
      }
    },
    {
      "type": "SEND_SMS",
      "config": {
        "templateId": "late_payment_sms",
        "to": "{{tenant.phone}}"
      }
    }
  ],
  "isActive": true
}
```

### **8. Blockchain**

#### **POST /api/blockchain/create-contract**
Create smart contract for lease agreement.

**Request Body:**
```json
{
  "contractType": "LEASE",
  "parties": [
    {
      "id": "landlord_123",
      "role": "LANDLORD",
      "signature": "0x1234..."
    },
    {
      "id": "tenant_456",
      "role": "TENANT",
      "signature": "0x5678..."
    }
  ],
  "terms": {
    "rentAmount": 1500,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "securityDeposit": 1500
  },
  "documentHash": "0xabcd..."
}
```

---

## 🔄 **Real-Time WebSocket**

### **Connection**
```javascript
const ws = new WebSocket('wss://your-domain.com/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'AUTH',
  token: 'your-jwt-token',
  userId: 'user_123',
  buildingId: 'building_456',
  role: 'ADMIN'
}));
```

### **Message Types**

#### **Dashboard Updates**
```json
{
  "type": "DASHBOARD_UPDATE",
  "buildingId": "building_456",
  "data": {
    "occupancy": 95.5,
    "revenue": 125000,
    "maintenance": {
      "pending": 12,
      "completed": 45
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Chat Messages**
```json
{
  "type": "CHAT_MESSAGE",
  "id": "msg_789",
  "userId": "user_123",
  "buildingId": "building_456",
  "content": "Hello, I have a maintenance request",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Notifications**
```json
{
  "type": "NOTIFICATION",
  "notification": {
    "id": "notif_123",
    "title": "New Maintenance Request",
    "body": "Unit 101 has submitted a maintenance request",
    "priority": "HIGH",
    "actionUrl": "/maintenance/request_456"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📱 **PWA Features**

### **Service Worker**
The system includes a comprehensive service worker for offline functionality:
- Offline data caching
- Background sync
- Push notifications
- Automatic retry logic

### **Manifest**
PWA manifest includes:
- App icons (72x72 to 512x512)
- Shortcuts for quick access
- Offline fallback page
- Theme colors and display modes

---

## 🚨 **Error Handling**

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "requestId": "req_123456789",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Error Types**
- `ValidationError` (400) - Invalid input data
- `AuthenticationError` (401) - Invalid or missing credentials
- `AuthorizationError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `DatabaseError` (500) - Database operation failed
- `ExternalServiceError` (503) - External service unavailable
- `RateLimitError` (429) - Too many requests

---

## 🔒 **Security**

### **Rate Limiting**
- 1000 requests per hour per user
- 100 requests per minute per IP
- Burst allowance: 20 requests per minute

### **Data Validation**
- All inputs validated with Zod schemas
- SQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations

### **Audit Logging**
All actions are logged with:
- User ID and role
- Action type and entity
- IP address and user agent
- Timestamp and details

---

## 📊 **Performance**

### **Response Times**
- API endpoints: <200ms average
- Database queries: <100ms average
- File uploads: <5s for 10MB files
- Real-time updates: <50ms latency

### **Caching**
- Redis for session data
- CDN for static assets
- Database query caching
- API response caching

---

## 🚀 **Getting Started**

### **1. Authentication**
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

### **2. Get Dashboard Data**
```bash
curl -X GET "https://your-domain.com/api/analytics/dashboard?userId=user_123" \
  -H "Authorization: Bearer your-jwt-token"
```

### **3. Upload Document**
```bash
curl -X POST https://your-domain.com/api/documents/upload \
  -H "Authorization: Bearer your-jwt-token" \
  -F "file=@document.pdf" \
  -F "buildingId=building_123" \
  -F "documentType=LEASE" \
  -F "uploadedBy=user_123"
```

---

## 🎯 **Best Practices**

1. **Always include authentication headers**
2. **Handle errors gracefully with retry logic**
3. **Use pagination for large datasets**
4. **Cache frequently accessed data**
5. **Implement proper loading states**
6. **Use WebSocket for real-time features**
7. **Validate all user inputs**
8. **Log important actions for audit**

---

## 📞 **Support**

For API support and questions:
- 📧 Email: api-support@your-domain.com
- 📚 Documentation: https://docs.your-domain.com
- 🐛 Bug Reports: https://github.com/your-repo/issues
- 💬 Community: https://discord.gg/your-community

---

**🎉 Your God-Tier Property Management System API is ready for production!** 🎉