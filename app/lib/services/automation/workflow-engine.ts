/**
 * Workflow Automation Engine
 * 
 * Features:
 * - 24/7 Automated SOPs
 * - Recurring Task Scheduling
 * - Payment Reminder Automation
 * - Lease Renewal Automation
 * - Compliance Automation
 * - Event-based Triggers
 * - Conditional Logic
 * - Multi-step Workflows
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';
import cron from 'node-cron';
import { CommunicationServices } from '@/lib/services/communication/communication-service';

/**
 * Workflow Trigger Types
 */
export enum TriggerType {
  SCHEDULED = 'SCHEDULED', // Time-based (cron)
  EVENT = 'EVENT', // Event-based (e.g., lease signed)
  CONDITIONAL = 'CONDITIONAL', // Condition-based (e.g., payment overdue)
  MANUAL = 'MANUAL', // Manually triggered
  WEBHOOK = 'WEBHOOK', // External webhook trigger
}

/**
 * Workflow Action Types
 */
export enum ActionType {
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SMS = 'SEND_SMS',
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_RECORD = 'UPDATE_RECORD',
  CALCULATE_FEE = 'CALCULATE_FEE',
  GENERATE_DOCUMENT = 'GENERATE_DOCUMENT',
  SCHEDULE_INSPECTION = 'SCHEDULE_INSPECTION',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  CREATE_MAINTENANCE_REQUEST = 'CREATE_MAINTENANCE_REQUEST',
  PROCESS_PAYMENT = 'PROCESS_PAYMENT',
  UPDATE_STATUS = 'UPDATE_STATUS',
  CALL_API = 'CALL_API',
  TRIGGER_WORKFLOW = 'TRIGGER_WORKFLOW',
}

/**
 * Workflow Definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: TriggerType;
    config: any;
  };
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
    value: any;
  }>;
  actions: Array<{
    type: ActionType;
    config: any;
    delay?: number; // Delay in seconds before executing
    condition?: any; // Optional condition for this specific action
  }>;
  isActive: boolean;
}

/**
 * Workflow Automation Engine
 */
export class WorkflowEngine {
  private activeWorkflows: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.initializeEngine();
  }

  /**
   * Initialize the workflow engine and load active workflows
   */
  private async initializeEngine() {
    try {
      logger.info("Initializing Workflow Automation Engine...");
      
      // Load all active workflows from database
      const workflows = await prisma.automatedWorkflow.findMany({
        where: { isActive: true },
      });

      for (const workflow of workflows) {
        await this.startWorkflow(workflow.id);
      }

      logger.info(`Loaded ${workflows.length} active workflows`);
    } catch (error) {
      logger.error("Failed to initialize workflow engine", error);
      throw new DatabaseError("Failed to initialize workflow engine");
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(definition: Omit<WorkflowDefinition, 'id'>): Promise<string> {
    const workflow = await prisma.automatedWorkflow.create({
      data: {
        name: definition.name,
        triggerType: definition.trigger.type,
        triggerConditions: JSON.stringify(definition.trigger.config),
        actions: JSON.stringify(definition.actions),
        isActive: definition.isActive,
        schedule: definition.trigger.type === TriggerType.SCHEDULED ? definition.trigger.config.cron : null,
      },
    });

    if (definition.isActive) {
      await this.startWorkflow(workflow.id);
    }

    return workflow.id;
  }

  /**
   * Start a workflow
   */
  async startWorkflow(workflowId: string): Promise<void> {
    const workflow = await prisma.automatedWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || !workflow.isActive) {
      return;
    }

    // Stop if already running
    if (this.activeWorkflows.has(workflowId)) {
      this.stopWorkflow(workflowId);
    }

    // Handle scheduled workflows
    if (workflow.triggerType === 'SCHEDULED' && workflow.schedule) {
      const task = cron.schedule(workflow.schedule, async () => {
        await this.executeWorkflow(workflowId);
      });
      
      this.activeWorkflows.set(workflowId, task);
      console.log(`Started scheduled workflow: ${workflow.name}`);
    }

    // Event-based workflows are triggered by events, not started here
  }

  /**
   * Stop a workflow
   */
  stopWorkflow(workflowId: string): void {
    const task = this.activeWorkflows.get(workflowId);
    if (task) {
      task.stop();
      this.activeWorkflows.delete(workflowId);
      console.log(`Stopped workflow: ${workflowId}`);
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, context?: any): Promise<void> {
    const workflow = await prisma.automatedWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const startTime = Date.now();
    
    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      // Parse workflow configuration
      const actions = JSON.parse(workflow.actions);
      const results: any[] = [];

      // Execute actions sequentially
      for (const action of actions) {
        // Apply delay if specified
        if (action.delay) {
          await this.delay(action.delay * 1000);
        }

        // Check action-specific conditions
        if (action.condition && !this.evaluateCondition(action.condition, context)) {
          continue;
        }

        // Execute action
        const result = await this.executeAction(action.type, action.config, context);
        results.push({ action: action.type, result });
      }

      // Update execution record
      const duration = Date.now() - startTime;
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          duration,
          result: JSON.stringify(results),
        },
      });

      // Update workflow statistics
      await prisma.automatedWorkflow.update({
        where: { id: workflowId },
        data: {
          executionCount: { increment: 1 },
          lastExecutedAt: new Date(),
          averageExecutionTime: duration,
        },
      });

    } catch (error) {
      // Record failure
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: (error as Error).message,
        },
      });

      console.error(`Workflow execution failed:`, error);
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(type: ActionType, config: any, context?: any): Promise<any> {
    console.log(`Executing action: ${type}`, config);

    switch (type) {
      case ActionType.SEND_EMAIL:
        return await this.sendEmail(config, context);
      
      case ActionType.SEND_SMS:
        return await this.sendSMS(config, context);
      
      case ActionType.CREATE_TASK:
        return await this.createTask(config, context);
      
      case ActionType.UPDATE_RECORD:
        return await this.updateRecord(config, context);
      
      case ActionType.CALCULATE_FEE:
        return await this.calculateFee(config, context);
      
      case ActionType.GENERATE_DOCUMENT:
        return await this.generateDocument(config, context);
      
      case ActionType.SEND_NOTIFICATION:
        return await this.sendNotification(config, context);
      
      case ActionType.PROCESS_PAYMENT:
        return await this.processPayment(config, context);
      
      case ActionType.UPDATE_STATUS:
        return await this.updateStatus(config, context);
      
      default:
        console.warn(`Unknown action type: ${type}`);
        return { success: false, message: 'Unknown action type' };
    }
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: any, context: any): boolean {
    const { field, operator, value } = condition;
    const fieldValue = this.getNestedValue(context, field);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Action implementations
  private async sendEmail(config: any, context?: any): Promise<any> {
    try {
      logger.info("Sending email via workflow", { to: config.to, template: config.template });
      
      // Use the communication service to send email
      const emailService = new CommunicationServices.EmailService();
      const result = await emailService.sendEmail({
        to: config.to,
        subject: config.subject,
        body: config.body || '',
        html: config.html,
      });
      
      logger.info("Email sent successfully", { messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error("Failed to send email", error);
      throw new ExternalServiceError("Failed to send email");
    }
  }

  private async sendSMS(config: any, context?: any): Promise<any> {
    try {
      logger.info("Sending SMS via workflow", { to: config.to });
      
      // Use the communication service to send SMS
      const smsService = new CommunicationServices.SMSService();
      const result = await smsService.sendSMS({
        to: config.to,
        message: config.message,
      });
      
      logger.info("SMS sent successfully", { messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error("Failed to send SMS", error);
      throw new ExternalServiceError("Failed to send SMS");
    }
  }

  private async createTask(config: any, context?: any): Promise<any> {
    try {
      logger.info("Creating task via workflow", { title: config.title });
      
      // Create task in database
      const task = await prisma.task.create({
        data: {
          title: config.title,
          description: config.description,
          assignedTo: config.assignedTo,
          dueDate: config.dueDate ? new Date(config.dueDate) : null,
          priority: config.priority || 'MEDIUM',
          status: 'OPEN',
          relatedEntity: config.relatedEntity,
          relatedId: config.relatedId,
          createdBy: 'system',
        },
      });
      
      logger.info("Task created successfully", { taskId: task.id });
      return { success: true, taskId: task.id };
    } catch (error) {
      logger.error("Failed to create task", error);
      throw new DatabaseError("Failed to create task");
    }
  }

  private async updateRecord(config: any, context?: any): Promise<any> {
    try {
      logger.info("Updating record via workflow", { model: config.model, id: config.id });
      
      // Update record based on model type
      let result;
      switch (config.model) {
        case 'payment':
          result = await prisma.payment.update({
            where: { id: config.id },
            data: config.data,
          });
          break;
        case 'maintenanceRequest':
          result = await prisma.maintenanceRequest.update({
            where: { id: config.id },
            data: config.data,
          });
          break;
        case 'tenant':
          result = await prisma.tenant.update({
            where: { id: config.id },
            data: config.data,
          });
          break;
        default:
          throw new Error(`Unsupported model: ${config.model}`);
      }
      
      logger.info("Record updated successfully", { model: config.model, id: config.id });
      return { success: true, result };
    } catch (error) {
      logger.error("Failed to update record", error);
      throw new DatabaseError("Failed to update record");
    }
  }

  private async calculateFee(config: any, context?: any): Promise<any> {
    try {
      logger.info("Calculating fee via workflow", { feeType: config.feeType });
      
      // Calculate fee based on type and configuration
      let fee = 0;
      switch (config.feeType) {
        case 'LATE_FEE':
          fee = config.amount || 50;
          break;
        case 'NSF_FEE':
          fee = config.amount || 35;
          break;
        case 'PET_FEE':
          fee = config.amount || 25;
          break;
        case 'PARKING_FEE':
          fee = config.amount || 75;
          break;
        default:
          fee = config.amount || 0;
      }
      
      // Create fee record in database
      const feeRecord = await prisma.fee.create({
        data: {
          type: config.feeType,
          amount: fee,
          description: config.description,
          relatedEntity: config.relatedEntity,
          relatedId: config.relatedId,
          createdBy: 'system',
        },
      });
      
      logger.info("Fee calculated successfully", { feeType: config.feeType, fee, feeId: feeRecord.id });
      return { success: true, fee, feeId: feeRecord.id };
    } catch (error) {
      logger.error("Failed to calculate fee", error);
      throw new DatabaseError("Failed to calculate fee");
    }
  }

  private async generateDocument(config: any, context?: any): Promise<any> {
    try {
      logger.info("Generating document via workflow", { template: config.template });
      
      // Use the document service to generate document
      // This would integrate with a document generation service
      const documentUrl = `/documents/${config.template}-${Date.now()}.pdf`;
      
      // Create document record in database
      const document = await prisma.document.create({
        data: {
          name: config.name || `${config.template} Document`,
          type: config.type || 'PDF',
          url: documentUrl,
          template: config.template,
          relatedEntity: config.relatedEntity,
          relatedId: config.relatedId,
          createdBy: 'system',
        },
      });
      
      logger.info("Document generated successfully", { template: config.template, documentId: document.id });
      return { success: true, documentUrl, documentId: document.id };
    } catch (error) {
      logger.error("Failed to generate document", error);
      throw new ExternalServiceError("Failed to generate document");
    }
  }

  private async sendNotification(config: any, context?: any): Promise<any> {
    try {
      logger.info("Sending notification via workflow", { type: config.type });
      
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: config.userId,
          title: config.title,
          message: config.message,
          type: config.type || 'INFO',
          relatedEntity: config.relatedEntity,
          relatedId: config.relatedId,
          isRead: false,
          createdBy: 'system',
        },
      });
      
      logger.info("Notification sent successfully", { notificationId: notification.id });
      return { success: true, notificationId: notification.id };
    } catch (error) {
      logger.error("Failed to send notification", error);
      throw new DatabaseError("Failed to send notification");
    }
  }

  private async processPayment(config: any, context?: any): Promise<any> {
    try {
      logger.info("Processing payment via workflow", { paymentId: config.paymentId });
      
      // Update payment status
      const payment = await prisma.payment.update({
        where: { id: config.paymentId },
        data: {
          status: 'PAID',
          paymentDate: new Date(),
          paymentMethod: config.paymentMethod || 'AUTO',
        },
      });
      
      logger.info("Payment processed successfully", { paymentId: config.paymentId });
      return { success: true, payment };
    } catch (error) {
      logger.error("Failed to process payment", error);
      throw new DatabaseError("Failed to process payment");
    }
  }

  private async updateStatus(config: any, context?: any): Promise<any> {
    try {
      logger.info("Updating status via workflow", { status: config.status });
      
      // Update status based on entity type
      let result;
      switch (config.entityType) {
        case 'maintenanceRequest':
          result = await prisma.maintenanceRequest.update({
            where: { id: config.entityId },
            data: { status: config.status },
          });
          break;
        case 'payment':
          result = await prisma.payment.update({
            where: { id: config.entityId },
            data: { status: config.status },
          });
          break;
        case 'task':
          result = await prisma.task.update({
            where: { id: config.entityId },
            data: { status: config.status },
          });
          break;
        default:
          throw new Error(`Unsupported entity type: ${config.entityType}`);
      }
      
      logger.info("Status updated successfully", { entityType: config.entityType, id: config.entityId, status: config.status });
      return { success: true, result };
    } catch (error) {
      logger.error("Failed to update status", error);
      throw new DatabaseError("Failed to update status");
    }
  }
}

/**
 * Pre-built Workflow Templates
 */
export const WorkflowTemplates = {
  /**
   * Late Payment Reminder Workflow
   */
  LATE_PAYMENT_REMINDER: {
    name: 'Late Payment Reminder',
    description: 'Send automated reminders for late payments',
    trigger: {
      type: TriggerType.SCHEDULED,
      config: {
        cron: '0 9 * * *', // Daily at 9 AM
      },
    },
    actions: [
      {
        type: ActionType.SEND_EMAIL,
        config: {
          template: 'payment_reminder',
          subject: 'Rent Payment Reminder',
        },
      },
      {
        type: ActionType.CALCULATE_FEE,
        delay: 259200, // 3 days later
        config: {
          feeType: 'LATE_FEE',
          amount: 50,
        },
      },
      {
        type: ActionType.SEND_SMS,
        delay: 432000, // 5 days later
        config: {
          message: 'Final notice: Rent payment overdue',
        },
      },
    ],
    isActive: true,
  },

  /**
   * Lease Renewal Workflow
   */
  LEASE_RENEWAL: {
    name: 'Lease Renewal Process',
    description: 'Automate lease renewal notices and follow-ups',
    trigger: {
      type: TriggerType.SCHEDULED,
      config: {
        cron: '0 10 * * 1', // Weekly on Monday at 10 AM
      },
    },
    actions: [
      {
        type: ActionType.SEND_EMAIL,
        config: {
          template: 'lease_renewal_60_days',
          subject: 'Lease Renewal - 60 Days Notice',
        },
      },
      {
        type: ActionType.SEND_EMAIL,
        delay: 2592000, // 30 days later
        config: {
          template: 'lease_renewal_30_days',
          subject: 'Lease Renewal - 30 Days Reminder',
        },
      },
      {
        type: ActionType.SEND_SMS,
        delay: 5184000, // 60 days later
        config: {
          message: 'Your lease expires soon. Please contact us.',
        },
      },
    ],
    isActive: true,
  },

  /**
   * Maintenance Request Auto-Assignment
   */
  MAINTENANCE_AUTO_ASSIGN: {
    name: 'Maintenance Request Auto-Assignment',
    description: 'Automatically assign maintenance requests to vendors',
    trigger: {
      type: TriggerType.EVENT,
      config: {
        event: 'maintenance_request_created',
      },
    },
    actions: [
      {
        type: ActionType.UPDATE_RECORD,
        config: {
          assignVendor: true,
        },
      },
      {
        type: ActionType.SEND_EMAIL,
        config: {
          to: 'vendor',
          template: 'maintenance_assignment',
        },
      },
      {
        type: ActionType.SEND_SMS,
        config: {
          to: 'tenant',
          message: 'Your maintenance request has been assigned.',
        },
      },
    ],
    isActive: true,
  },

  /**
   * Move-Out Inspection Workflow
   */
  MOVE_OUT_INSPECTION: {
    name: 'Move-Out Inspection Process',
    description: 'Automate move-out inspection scheduling',
    trigger: {
      type: TriggerType.EVENT,
      config: {
        event: 'lease_ending_30_days',
      },
    },
    actions: [
      {
        type: ActionType.SEND_EMAIL,
        config: {
          template: 'move_out_inspection_schedule',
          subject: 'Schedule Your Move-Out Inspection',
        },
      },
      {
        type: ActionType.SCHEDULE_INSPECTION,
        config: {
          type: 'MOVE_OUT',
        },
      },
      {
        type: ActionType.SEND_NOTIFICATION,
        delay: 86400, // 1 day before
        config: {
          message: 'Move-out inspection reminder',
        },
      },
    ],
    isActive: true,
  },

  /**
   * Compliance Check Workflow
   */
  COMPLIANCE_CHECK: {
    name: 'Automated Compliance Check',
    description: 'Run compliance checks on all properties',
    trigger: {
      type: TriggerType.SCHEDULED,
      config: {
        cron: '0 0 1 * *', // Monthly on the 1st
      },
    },
    actions: [
      {
        type: ActionType.CALL_API,
        config: {
          endpoint: '/api/compliance/check',
          method: 'POST',
        },
      },
      {
        type: ActionType.GENERATE_DOCUMENT,
        config: {
          template: 'compliance_report',
          format: 'PDF',
        },
      },
      {
        type: ActionType.SEND_EMAIL,
        config: {
          template: 'compliance_report',
          attachReport: true,
        },
      },
    ],
    isActive: true,
  },
};

/**
 * Export workflow engine
 */
export default WorkflowEngine;

