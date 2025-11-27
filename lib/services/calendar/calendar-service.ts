import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Type definitions (will be available after Prisma generate)
type CalendarEvent = any;
type AnnualDeadline = any;
type Reminder = any;

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  eventType: string;
  priority?: string;
  startDate: Date;
  endDate?: Date;
  isAllDay?: boolean;
  location?: string;
  recurringRules?: string;
  reminderSettings?: string;
  attachments?: string;
  tags?: string;
  buildingId?: string;
  userId?: string;
  createdBy: string;
}

export interface CreateAnnualDeadlineInput {
  title: string;
  description?: string;
  deadlineType: string;
  dueDate: Date;
  recurringMonth: number;
  recurringDay: number;
  advanceNotice: number;
  priority?: string;
  jurisdiction?: string;
  requirements?: string;
  penaltyInfo?: string;
  buildingId?: string;
  createdBy: string;
}

export interface CreateReminderInput {
  title: string;
  message?: string;
  reminderType: string;
  scheduledFor: Date;
  eventId?: string;
  deadlineId?: string;
  userId?: string;
  priority?: string;
  repeatPattern?: string;
  maxOccurrences?: number;
}

export class CalendarService {
  // Calendar Event Management
  async createEvent(data: CreateCalendarEventInput): Promise<CalendarEvent> {
    try {
      const event = await (prisma as any).calendarEvent.create({
        data: {
          ...data,
          status: "SCHEDULED",
        },
        include: {
          building: true,
          user: true,
          reminders: true,
        },
      });
      return event;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  async getEvents(filters?: {
    buildingId?: string;
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<CalendarEvent[]> {
    try {
      const where: any = {};
      
      if (filters?.buildingId) where.buildingId = filters.buildingId;
      if (filters?.userId) where.userId = filters.userId;
      if (filters?.eventType) where.eventType = filters.eventType;
      if (filters?.status) where.status = filters.status;
      
      if (filters?.startDate || filters?.endDate) {
        where.startDate = {};
        if (filters?.startDate) where.startDate.gte = filters.startDate;
        if (filters?.endDate) where.startDate.lte = filters.endDate;
      }

      const events = await (prisma as any).calendarEvent.findMany({
        where,
        include: {
          building: true,
          user: true,
          reminders: true,
        },
        orderBy: {
          startDate: "asc",
        },
      });

      return events;
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      throw new Error("Failed to fetch calendar events");
    }
  }

  async getEventById(id: string): Promise<CalendarEvent | null> {
    try {
      const event = await (prisma as any).calendarEvent.findUnique({
        where: { id },
        include: {
          building: true,
          user: true,
          reminders: true,
        },
      });
      return event;
    } catch (error) {
      console.error("Error fetching calendar event:", error);
      throw new Error("Failed to fetch calendar event");
    }
  }

  async updateEvent(id: string, data: Partial<CreateCalendarEventInput>): Promise<CalendarEvent> {
    try {
      const event = await (prisma as any).calendarEvent.update({
        where: { id },
        data,
        include: {
          building: true,
          user: true,
          reminders: true,
        },
      });
      return event;
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw new Error("Failed to update calendar event");
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await (prisma as any).calendarEvent.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      throw new Error("Failed to delete calendar event");
    }
  }

  // Annual Deadline Management
  async createAnnualDeadline(data: CreateAnnualDeadlineInput): Promise<AnnualDeadline> {
    try {
      const deadline = await (prisma as any).annualDeadline.create({
        data: {
          ...data,
          isActive: true,
          autoCreateEvent: true,
        },
        include: {
          building: true,
          reminders: true,
        },
      });
      
      // Automatically create calendar event if autoCreateEvent is true
      if (deadline.autoCreateEvent) {
        await this.createEvent({
          title: deadline.title,
          description: deadline.description,
          eventType: "DEADLINE",
          priority: deadline.priority || "HIGH",
          startDate: deadline.dueDate,
          buildingId: deadline.buildingId || undefined,
          createdBy: data.createdBy,
        });
      }

      return deadline;
    } catch (error) {
      console.error("Error creating annual deadline:", error);
      throw new Error("Failed to create annual deadline");
    }
  }

  async getAnnualDeadlines(filters?: {
    buildingId?: string;
    deadlineType?: string;
    isActive?: boolean;
  }): Promise<AnnualDeadline[]> {
    try {
      const where: any = {};
      
      if (filters?.buildingId) where.buildingId = filters.buildingId;
      if (filters?.deadlineType) where.deadlineType = filters.deadlineType;
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;

      const deadlines = await (prisma as any).annualDeadline.findMany({
        where,
        include: {
          building: true,
          reminders: true,
        },
        orderBy: {
          dueDate: "asc",
        },
      });

      return deadlines;
    } catch (error) {
      console.error("Error fetching annual deadlines:", error);
      throw new Error("Failed to fetch annual deadlines");
    }
  }

  // Reminder Management
  async createReminder(data: CreateReminderInput): Promise<Reminder> {
    try {
      const reminder = await (prisma as any).reminder.create({
        data: {
          ...data,
          status: "PENDING",
        },
        include: {
          event: true,
          deadline: true,
          user: true,
        },
      });
      return reminder;
    } catch (error) {
      console.error("Error creating reminder:", error);
      throw new Error("Failed to create reminder");
    }
  }

  async getReminders(filters?: {
    eventId?: string;
    deadlineId?: string;
    userId?: string;
    status?: string;
    reminderType?: string;
  }): Promise<Reminder[]> {
    try {
      const where: any = {};
      
      if (filters?.eventId) where.eventId = filters.eventId;
      if (filters?.deadlineId) where.deadlineId = filters.deadlineId;
      if (filters?.userId) where.userId = filters.userId;
      if (filters?.status) where.status = filters.status;
      if (filters?.reminderType) where.reminderType = filters.reminderType;

      const reminders = await (prisma as any).reminder.findMany({
        where,
        include: {
          event: true,
          deadline: true,
          user: true,
        },
        orderBy: {
          scheduledFor: "asc",
        },
      });

      return reminders;
    } catch (error) {
      console.error("Error fetching reminders:", error);
      throw new Error("Failed to fetch reminders");
    }
  }

  // Calendar Settings
  async getCalendarSettings(userId: string): Promise<any> {
    try {
      let settings = await (prisma as any).calendarSettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        settings = await (prisma as any).calendarSettings.create({
          data: {
            userId,
            timezone: "UTC",
          },
        });
      }

      return settings;
    } catch (error) {
      console.error("Error fetching calendar settings:", error);
      throw new Error("Failed to fetch calendar settings");
    }
  }

  async updateCalendarSettings(userId: string, data: any): Promise<any> {
    try {
      const settings = await (prisma as any).calendarSettings.upsert({
        where: { userId },
        update: data,
        create: {
          userId,
          ...data,
        },
      });
      return settings;
    } catch (error) {
      console.error("Error updating calendar settings:", error);
      throw new Error("Failed to update calendar settings");
    }
  }

  // Process pending reminders
  async processPendingReminders(): Promise<void> {
    try {
      const pendingReminders = await (prisma as any).reminder.findMany({
        where: {
          status: "PENDING",
          scheduledFor: {
            lte: new Date(),
          },
          isActive: true,
        },
        include: {
          event: true,
          deadline: true,
          user: true,
        },
      });

      for (const reminder of pendingReminders) {
        // Here you would integrate with email/SMS service
        console.log(`Processing reminder for ${reminder.user?.email}: ${reminder.title}`);
        
        // Update reminder status
        await (prisma as any).reminder.update({
          where: { id: reminder.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            sentCount: reminder.sentCount + 1,
          },
        });
      }
    } catch (error) {
      console.error("Error processing pending reminders:", error);
      throw new Error("Failed to process pending reminders");
    }
  }
}

export const calendarService = new CalendarService();
