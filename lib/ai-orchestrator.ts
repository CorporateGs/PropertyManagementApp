// lib/ai-orchestrator.ts
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();

export class AIAgentOrchestrator {
    private anthropic: Anthropic;

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || '',
        });
    }

    /**
     * Process an order by assigning it to an AI agent and executing tasks
     */
    async processOrder(orderId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { client: true }
        });

        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        try {
            // Update order status
            await this.updateOrderStatus(orderId, 'PROCESSING', 'Order received and being processed');

            // 1. Find or assign AI agent
            const agent = await this.assignAgent(order);

            // 2. Create execution plan
            const tasks = await this.createExecutionPlan(order, agent);

            // 3. Execute tasks
            await this.updateOrderStatus(orderId, 'IN_PROGRESS', 'AI agent is working on your order');

            for (const task of tasks) {
                await this.executeTask(task, agent);
            }

            // 4. Deliver results
            await this.deliverResults(order);

            // 5. Mark as completed
            await this.updateOrderStatus(orderId, 'COMPLETED', 'Order completed successfully');

            // 6. Notify client
            await this.notifyClient(order);

        } catch (error) {
            console.error(`Error processing order ${orderId}:`, error);
            await this.handleOrderFailure(order, error as Error);
        }
    }

    /**
     * Assign an appropriate AI agent to the order
     */
    private async assignAgent(order: any) {
        // Determine required agent type
        const agentType = this.getRequiredAgentType(order.serviceType);

        // Try to find dedicated agent for this client
        let agent = await prisma.aIAgent.findFirst({
            where: {
                clientId: order.clientId,
                type: agentType,
                isActive: true
            }
        });

        // If no dedicated agent, find available agent
        if (!agent) {
            agent = await prisma.aIAgent.findFirst({
                where: {
                    type: agentType,
                    status: 'AVAILABLE',
                    isActive: true,
                    currentLoad: { lt: prisma.aIAgent.fields.maxLoad }
                },
                orderBy: {
                    currentLoad: 'asc' // Least loaded agent first
                }
            });
        }

        if (!agent) {
            throw new Error(`No available ${agentType} agent found`);
        }

        // Update order with agent
        await prisma.order.update({
            where: { id: order.id },
            data: { aiAgentId: agent.id }
        });

        // Increment agent load
        await prisma.aIAgent.update({
            where: { id: agent.id },
            data: {
                currentLoad: { increment: 1 },
                status: 'BUSY'
            }
        });

        return agent;
    }

    /**
     * Create execution plan (tasks) for the order
     */
    private async createExecutionPlan(order: any, agent: any) {
        const requirements = JSON.parse(order.requirements);
        const tasks: any[] = [];

        switch (order.serviceType) {
            case 'WEBSITE':
                tasks.push(
                    { type: 'ANALYZE', description: 'Analyze website requirements', input: requirements },
                    { type: 'DESIGN', description: 'Create design system and mockups', input: requirements },
                    { type: 'CODE', description: 'Build website with Next.js', input: requirements },
                    { type: 'DEPLOY', description: 'Deploy to Vercel', input: requirements },
                    { type: 'TEST', description: 'Test website functionality', input: requirements }
                );
                break;

            case 'CHATBOT':
                tasks.push(
                    { type: 'ANALYZE', description: 'Analyze chatbot requirements', input: requirements },
                    { type: 'DESIGN', description: 'Design conversation flows', input: requirements },
                    { type: 'CODE', description: 'Build and train chatbot', input: requirements },
                    { type: 'DEPLOY', description: 'Deploy chatbot service', input: requirements },
                    { type: 'TEST', description: 'Test chatbot responses', input: requirements }
                );
                break;

            case 'PHONE_ASSISTANT':
                tasks.push(
                    { type: 'ANALYZE', description: 'Analyze phone assistant requirements', input: requirements },
                    { type: 'DESIGN', description: 'Design call flows', input: requirements },
                    { type: 'CODE', description: 'Configure voice AI', input: requirements },
                    { type: 'DEPLOY', description: 'Set up phone number and routing', input: requirements },
                    { type: 'TEST', description: 'Test phone assistant', input: requirements }
                );
                break;

            case 'TAX_PREP':
                tasks.push(
                    { type: 'ANALYZE', description: 'Review tax documents', input: requirements },
                    { type: 'CODE', description: 'Prepare tax return', input: requirements },
                    { type: 'REVIEW', description: 'Review for accuracy', input: requirements },
                    { type: 'DEPLOY', description: 'E-file tax return', input: requirements }
                );
                break;
        }

        // Create tasks in database
        const createdTasks = [];
        for (const taskData of tasks) {
            const task = await prisma.aITask.create({
                data: {
                    orderId: order.id,
                    aiAgentId: agent.id,
                    taskType: taskData.type,
                    description: taskData.description,
                    input: JSON.stringify(taskData.input)
                }
            });
            createdTasks.push(task);
        }

        return createdTasks;
    }

    /**
     * Execute a single task using AI
     */
    private async executeTask(task: any, agent: any) {
        try {
            // Update task status
            await prisma.aITask.update({
                where: { id: task.id },
                data: {
                    status: 'IN_PROGRESS',
                    startedAt: new Date()
                }
            });

            // Get service template for instructions
            const order = await prisma.order.findUnique({
                where: { id: task.orderId }
            });

            const template = await prisma.serviceTemplate.findFirst({
                where: { serviceType: order!.serviceType }
            });

            // Prepare AI prompt
            const prompt = this.buildTaskPrompt(task, template, agent);

            // Call Anthropic AI
            const startTime = Date.now();
            const response = await this.anthropic.messages.create({
                model: agent.model,
                max_tokens: 4096,
                system: agent.systemPrompt,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const duration = Math.floor((Date.now() - startTime) / 1000);
            const result = response.content[0].type === 'text' ? response.content[0].text : '';

            // Update task with result
            await prisma.aITask.update({
                where: { id: task.id },
                data: {
                    status: 'COMPLETED',
                    output: result,
                    completedAt: new Date(),
                    duration
                }
            });

            return result;

        } catch (error) {
            console.error(`Error executing task ${task.id}:`, error);

            // Retry logic
            if (task.retryCount < task.maxRetries) {
                await prisma.aITask.update({
                    where: { id: task.id },
                    data: {
                        retryCount: { increment: 1 },
                        status: 'PENDING'
                    }
                });
                // Retry the task
                return await this.executeTask(task, agent);
            } else {
                // Mark as failed
                await prisma.aITask.update({
                    where: { id: task.id },
                    data: {
                        status: 'FAILED',
                        error: (error as Error).message,
                        completedAt: new Date()
                    }
                });
                throw error;
            }
        }
    }

    /**
     * Build prompt for AI task execution
     */
    private buildTaskPrompt(task: any, template: any, agent: any): string {
        const input = JSON.parse(task.input || '{}');

        return `
# Task: ${task.description}
# Task Type: ${task.taskType}

## Service Instructions
${template?.instructions || 'No specific instructions available'}

## Client Requirements
${JSON.stringify(input, null, 2)}

## Your Task
${task.description}

Please complete this task following the service instructions above. Provide a detailed response with:
1. What you did
2. The result/output
3. Any files or URLs created
4. Next steps (if applicable)

Be thorough and professional. This is for a real client.
`;
    }

    /**
     * Deliver results to client
     */
    private async deliverResults(order: any) {
        const tasks = await prisma.aITask.findMany({
            where: { orderId: order.id },
            orderBy: { createdAt: 'asc' }
        });

        // Compile deliverables from task outputs
        const deliverables: any = {
            summary: `Your ${order.serviceType} has been completed!`,
            tasks: tasks.map(t => ({
                type: t.taskType,
                description: t.description,
                result: t.output
            }))
        };

        // Create delivery record
        await prisma.delivery.create({
            data: {
                orderId: order.id,
                deliveryType: this.getDeliveryType(order.serviceType),
                title: `${order.serviceType} Delivery`,
                description: `Your ${order.serviceType} is ready!`,
                content: JSON.stringify(deliverables),
                status: 'DELIVERED',
                deliveredAt: new Date()
            }
        });
    }

    /**
     * Notify client about order completion
     */
    private async notifyClient(order: any) {
        // Create AI interaction record
        await prisma.aIInteraction.create({
            data: {
                aiAgentId: order.aiAgentId,
                clientId: order.clientId,
                orderId: order.id,
                type: 'EMAIL',
                direction: 'OUTBOUND',
                subject: `Your ${order.serviceType} is ready!`,
                content: `Great news! Your ${order.serviceType} order has been completed and is ready for review.`
            }
        });

        // TODO: Send actual email notification
    }

    /**
     * Handle order failure
     */
    private async handleOrderFailure(order: any, error: Error) {
        await this.updateOrderStatus(
            order.id,
            'FAILED',
            `Order failed: ${error.message}`
        );

        // Notify client of failure
        await prisma.aIInteraction.create({
            data: {
                aiAgentId: order.aiAgentId || '',
                clientId: order.clientId,
                orderId: order.id,
                type: 'EMAIL',
                direction: 'OUTBOUND',
                subject: `Issue with your ${order.serviceType} order`,
                content: `We encountered an issue processing your order. Our team has been notified and will reach out shortly.`
            }
        });
    }

    /**
     * Update order status
     */
    private async updateOrderStatus(orderId: string, status: string, reason?: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        await prisma.orderStatusHistory.create({
            data: {
                orderId,
                fromStatus: order?.status,
                toStatus: status,
                reason,
                changedBy: 'SYSTEM'
            }
        });
    }

    /**
     * Get required agent type for service
     */
    private getRequiredAgentType(serviceType: string): string {
        const mapping: Record<string, string> = {
            'WEBSITE': 'WEBSITE_BUILDER',
            'CHATBOT': 'CHATBOT_CREATOR',
            'PHONE_ASSISTANT': 'PHONE_AI',
            'TAX_PREP': 'TAX_SPECIALIST',
            'LEGAL': 'LEGAL_AI',
            'ACCOUNTING': 'GENERAL'
        };
        return mapping[serviceType] || 'GENERAL';
    }

    /**
     * Get delivery type for service
     */
    private getDeliveryType(serviceType: string): string {
        const mapping: Record<string, string> = {
            'WEBSITE': 'WEBSITE_URL',
            'CHATBOT': 'CHATBOT_EMBED',
            'PHONE_ASSISTANT': 'PHONE_NUMBER',
            'TAX_PREP': 'DOCUMENT'
        };
        return mapping[serviceType] || 'DOCUMENT';
    }
}
