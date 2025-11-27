# Property Scoring System Implementation

## Overview

The Property Scoring System provides a comprehensive, credit-score-like evaluation (0-850) for properties based on five key performance areas. This system helps property managers assess, monitor, and improve property performance across critical operational metrics.

## Score Components

### 1. Budget Score (25% weight - max 212.5 points)
- **Budget Variance**: Percentage difference between budgeted and actual expenses
- **On-time Payments**: Percentage of rent payments received on time
- **Cost Control**: Efficiency in managing operational costs

### 2. Compliance Score (25% weight - max 212.5 points)
- **PICUS Compliance**: Safety and environmental compliance rate
- **NOCIS Compliance**: Financial and fair housing compliance
- **Inspection Pass Rate**: Percentage of passed compliance inspections
- **Pending Violations**: Number of overdue compliance issues

### 3. Tax Filing Score (20% weight - max 170 points)
- **CAO Returns Filed**: Quarterly tax return filing rate
- **On-time Filing**: Percentage of returns filed by deadline
- **Filing Accuracy**: Completeness and accuracy of tax documents

### 4. Maintenance Score (20% weight - max 170 points)
- **Resolution Time**: Average time to complete maintenance requests
- **Open Issues**: Number of unresolved maintenance requests
- **Tenant Satisfaction**: Tenant satisfaction ratings (when available)
- **Preventive Maintenance**: Completion rate of scheduled maintenance

### 5. Legal Score (10% weight - max 85 points)
- **Active Lawsuits**: Current ongoing legal disputes
- **Legal Incidents**: Number of recorded legal incidents
- **Compliance Violations**: Failed compliance checks
- **Insurance Claims**: Number of insurance claims filed

## Score Grades

| Grade | Score Range | Color | Description |
|-------|-------------|-------|-------------|
| EXCELLENT | 750-850 | Green | Exceptional property management |
| GOOD | 650-749 | Blue | Above average performance |
| FAIR | 550-649 | Yellow | Average performance |
| POOR | 450-549 | Orange | Below average performance |
| VERY_POOR | 0-449 | Red | Critical improvement needed |

## Implementation Details

### Database Schema Updates

The following fields were added to the `Building` model:
- `propertyScore` - Overall property score (0-850)
- `budgetScore` - Budget component score (0-100)
- `complianceScore` - Compliance component score (0-100)
- `taxFilingScore` - Tax filing component score (0-100)
- `maintenanceScore` - Maintenance component score (0-100)
- `legalScore` - Legal component score (0-100)
- `lastScoreUpdate` - Timestamp of last score calculation
- `scoreBreakdown` - JSON breakdown of all score factors

New `PropertyScoreHistory` model for tracking score changes:
- `buildingId` - Reference to building
- `previousScore` - Previous overall score
- `newScore` - New overall score
- `changeReason` - Reason for score change
- `changeType` - Type of change (IMPROVEMENT/DECLINE/NO_CHANGE/INITIAL)
- `breakdown` - JSON of component scores
- `calculatedAt` - Calculation timestamp

### API Endpoints

#### GET /api/property-scores
- Query individual property score: `?buildingId={id}`
- Calculate/update scores: `?update=true`
- Update all property scores: `?update=true` (no buildingId)

#### POST /api/property-scores
- `buildingId` (required) - Property to score
- `action` - "update" or "calculate"

### Components

#### PropertyScoreCard
- Comprehensive property score visualization
- Tabbed interface for detailed breakdowns
- Real-time score updates
- Recommendations display
- Factor analysis with progress bars

#### Property Scores Dashboard
- Overview of all property scores
- Average score calculations
- Score distribution analysis
- Individual property selection
- Bulk score updates

### Service Architecture

#### PropertyScoreService
- `calculatePropertyScore(buildingId)` - Calculate score without saving
- `updatePropertyScore(buildingId)` - Calculate and save score
- `updateAllPropertyScores()` - Update all properties
- `getScoreRangeInfo(grade)` - Get grade information

## Usage Examples

### Calculate Individual Property Score
```typescript
const score = await PropertyScoreService.calculatePropertyScore('building-123');
console.log(score.overallScore); // 725
console.log(score.grade); // GOOD
console.log(score.recommendations); // Array of improvement suggestions
```

### Update All Property Scores
```typescript
const results = await PropertyScoreService.updateAllPropertyScores();
console.log(`Updated ${results.length} properties`);
```

### Frontend Integration
```tsx
<PropertyScoreCard 
  buildingId="building-123"
  onUpdate={(data) => console.log('Score updated:', data)}
/>
```

## Data Sources

The scoring system integrates with existing database tables:
- **Building & Units**: Property基本信息和预算计算
- **Tenants & Payments**: 租金支付时间和准确性
- **MaintenanceRequest**: 维修请求响应时间和解决率
- **ComplianceCheck & ComplianceProgram**: 合规性检查结果
- **Document**: 税务文件和法律文件

## Future Enhancements

1. **Historical Analytics**: Score trend analysis over time
2. **Benchmarking**: Compare properties against similar properties
3. **Predictive Scoring**: ML-based future score predictions
4. **Automated Alerts**: Notifications for score changes
5. **Integration APIs**: External data source integration
6. **Mobile App**: On-the-go score monitoring
7. **Custom Weighting**: User-adjustable score component weights

## Performance Considerations

- Score calculations are optimized with parallel processing
- Caching implemented for frequently accessed scores
- Background job support for bulk updates
- Database indexing for score history queries

## Security & Privacy

- Score data access controlled by authentication
- Audit trail for all score changes
- Sensitive factor data properly protected
- GDPR compliance for score history retention

## Monitoring & Maintenance

- Automated score recalculation schedules
- Performance metrics tracking
- Error logging and alerting
- Regular data quality checks

## Conclusion

The Property Scoring System provides a comprehensive, data-driven approach to property performance evaluation. By leveraging existing operational data, it delivers actionable insights for property management improvement while maintaining flexibility for future enhancements.

The system successfully implements a credit-score-like evaluation that is:
- **Comprehensive**: Covers all major operational areas
- **Actionable**: Provides specific recommendations
- **Scalable**: Works for single properties to large portfolios
- **Flexible**: Adaptable to different property types and markets
- **Transparent**: Clear scoring methodology and factor breakdown
