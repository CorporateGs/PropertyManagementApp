/**
 * Real-Time WebSocket Service
 * 
 * Features:
 * - Live dashboard updates
 * - Real-time notifications
 * - Collaborative editing
 * - Live chat
 * - System monitoring
 * - Event broadcasting
 * - Connection management
 * - Message queuing
 */

import { Server as WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';

/**
 * WebSocket Message Types
 */
export enum MessageType {
  // Authentication
  AUTH = 'AUTH',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_ERROR = 'AUTH_ERROR',
  
  // Dashboard updates
  DASHBOARD_UPDATE = 'DASHBOARD_UPDATE',
  STATS_UPDATE = 'STATS_UPDATE',
  
  // Notifications
  NOTIFICATION = 'NOTIFICATION',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  
  // Real-time data
  TENANT_UPDATE = 'TENANT_UPDATE',
  UNIT_UPDATE = 'UNIT_UPDATE',
  MAINTENANCE_UPDATE = 'MAINTENANCE_UPDATE',
  PAYMENT_UPDATE = 'PAYMENT_UPDATE',
  
  // Chat
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  CHAT_TYPING = 'CHAT_TYPING',
  CHAT_USER_JOINED = 'CHAT_USER_JOINED',
  CHAT_USER_LEFT = 'CHAT_USER_LEFT',
  
  // System
  SYSTEM_STATUS = 'SYSTEM_STATUS',
  ERROR = 'ERROR',
  PING = 'PING',
  PONG = 'PONG',
}

/**
 * WebSocket Client Interface
 */
interface WebSocketClient {
  id: string;
  userId: string;
  buildingId?: string;
  role: string;
  socket: any;
  isAuthenticated: boolean;
  lastPing: Date;
  subscriptions: Set<string>;
}

/**
 * WebSocket Service
 */
export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private messageQueue: Map<string, any[]> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(server: any): void {
    try {
      this.wss = new WebSocketServer({ 
        server,
        path: '/ws',
        perMessageDeflate: false
      });

      this.wss.on('connection', (ws: any, req: IncomingMessage) => {
        this.handleConnection(ws, req);
      });

      // Start ping/pong interval
      this.startPingInterval();

      // Start cleanup interval
      this.startCleanupInterval();

      logger.info('WebSocket service initialized');
    } catch (error) {
      logger.error('Failed to initialize WebSocket service', error);
      throw new ExternalServiceError('Failed to initialize WebSocket service');
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: any, req: IncomingMessage): void {
    const clientId = this.generateClientId();
    
    const client: WebSocketClient = {
      id: clientId,
      userId: '',
      buildingId: undefined,
      role: '',
      socket: ws,
      isAuthenticated: false,
      lastPing: new Date(),
      subscriptions: new Set()
    };

    this.clients.set(clientId, client);

    // Set up message handlers
    ws.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });

    ws.on('error', (error: Error) => {
      logger.error('WebSocket error', { clientId, error: error.message });
      this.handleDisconnection(clientId);
    });

    // Send welcome message
    this.sendMessage(clientId, {
      type: MessageType.AUTH,
      message: 'Please authenticate to continue'
    });

    logger.info('New WebSocket connection', { clientId });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(clientId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        logger.warn('Message from unknown client', { clientId });
        return;
      }

      logger.debug('Received message', { clientId, type: message.type });

      switch (message.type) {
        case MessageType.AUTH:
          this.handleAuthentication(clientId, message);
          break;
        
        case MessageType.PING:
          this.handlePing(clientId);
          break;
        
        case MessageType.CHAT_MESSAGE:
          this.handleChatMessage(clientId, message);
          break;
        
        case MessageType.CHAT_TYPING:
          this.handleChatTyping(clientId, message);
          break;
        
        case MessageType.NOTIFICATION_READ:
          this.handleNotificationRead(clientId, message);
          break;
        
        default:
          logger.warn('Unknown message type', { clientId, type: message.type });
      }
    } catch (error) {
      logger.error('Failed to handle message', { clientId, error });
      this.sendError(clientId, 'Invalid message format');
    }
  }

  /**
   * Handle client authentication
   */
  private async handleAuthentication(clientId: string, message: any): Promise<void> {
    try {
      const { token, userId, buildingId, role } = message;
      
      // Validate token (simplified - would use proper JWT validation)
      if (!token || !userId) {
        this.sendError(clientId, 'Invalid authentication credentials');
        return;
      }

      const client = this.clients.get(clientId);
      if (!client) return;

      // Update client info
      client.userId = userId;
      client.buildingId = buildingId;
      client.role = role;
      client.isAuthenticated = true;

      // Join building room
      if (buildingId) {
        this.joinRoom(clientId, `building:${buildingId}`);
      }

      // Join user-specific room
      this.joinRoom(clientId, `user:${userId}`);

      // Send queued messages
      this.sendQueuedMessages(clientId);

      this.sendMessage(clientId, {
        type: MessageType.AUTH_SUCCESS,
        message: 'Authentication successful'
      });

      // Notify others of user joining
      this.broadcastToRoom(`building:${buildingId}`, {
        type: MessageType.CHAT_USER_JOINED,
        userId,
        timestamp: new Date().toISOString()
      });

      logger.info('Client authenticated', { clientId, userId, buildingId });
    } catch (error) {
      logger.error('Authentication failed', { clientId, error });
      this.sendError(clientId, 'Authentication failed');
    }
  }

  /**
   * Handle ping message
   */
  private handlePing(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = new Date();
    }
    
    this.sendMessage(clientId, {
      type: MessageType.PONG,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle chat message
   */
  private handleChatMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.isAuthenticated) return;

    const chatMessage = {
      type: MessageType.CHAT_MESSAGE,
      id: this.generateMessageId(),
      userId: client.userId,
      buildingId: client.buildingId,
      content: message.content,
      timestamp: new Date().toISOString()
    };

    // Broadcast to building room
    if (client.buildingId) {
      this.broadcastToRoom(`building:${client.buildingId}`, chatMessage);
    }

    logger.info('Chat message sent', { 
      clientId, 
      buildingId: client.buildingId,
      content: message.content.substring(0, 50) + '...'
    });
  }

  /**
   * Handle chat typing indicator
   */
  private handleChatTyping(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.isAuthenticated) return;

    const typingMessage = {
      type: MessageType.CHAT_TYPING,
      userId: client.userId,
      isTyping: message.isTyping,
      timestamp: new Date().toISOString()
    };

    // Broadcast to building room (excluding sender)
    if (client.buildingId) {
      this.broadcastToRoom(`building:${client.buildingId}`, typingMessage, clientId);
    }
  }

  /**
   * Handle notification read
   */
  private handleNotificationRead(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.isAuthenticated) return;

    // Update notification status in database
    // This would typically update the database
    logger.info('Notification marked as read', { 
      clientId, 
      notificationId: message.notificationId 
    });
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Notify others of user leaving
    if (client.isAuthenticated && client.buildingId) {
      this.broadcastToRoom(`building:${client.buildingId}`, {
        type: MessageType.CHAT_USER_LEFT,
        userId: client.userId,
        timestamp: new Date().toISOString()
      });
    }

    // Remove from all rooms
    this.rooms.forEach((roomClients, roomName) => {
      roomClients.delete(clientId);
      if (roomClients.size === 0) {
        this.rooms.delete(roomName);
      }
    });

    this.clients.delete(clientId);
    logger.info('Client disconnected', { clientId });
  }

  /**
   * Join a room
   */
  private joinRoom(clientId: string, roomName: string): void {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    
    this.rooms.get(roomName)!.add(clientId);
    
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.add(roomName);
    }

    logger.debug('Client joined room', { clientId, roomName });
  }

  /**
   * Leave a room
   */
  private leaveRoom(clientId: string, roomName: string): void {
    const room = this.rooms.get(roomName);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        this.rooms.delete(roomName);
      }
    }

    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.delete(roomName);
    }

    logger.debug('Client left room', { clientId, roomName });
  }

  /**
   * Send message to specific client
   */
  private sendMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== 1) {
      // Queue message if client is not available
      this.queueMessage(clientId, message);
      return;
    }

    try {
      client.socket.send(JSON.stringify(message));
    } catch (error) {
      logger.error('Failed to send message', { clientId, error });
      this.queueMessage(clientId, message);
    }
  }

  /**
   * Broadcast message to room
   */
  private broadcastToRoom(roomName: string, message: any, excludeClientId?: string): void {
    const room = this.rooms.get(roomName);
    if (!room) return;

    room.forEach(clientId => {
      if (clientId !== excludeClientId) {
        this.sendMessage(clientId, message);
      }
    });

    logger.debug('Message broadcasted to room', { roomName, clientCount: room.size });
  }

  /**
   * Broadcast to all clients
   */
  private broadcastToAll(message: any): void {
    this.clients.forEach((client, clientId) => {
      this.sendMessage(clientId, message);
    });

    logger.debug('Message broadcasted to all clients', { clientCount: this.clients.size });
  }

  /**
   * Queue message for offline client
   */
  private queueMessage(clientId: string, message: any): void {
    if (!this.messageQueue.has(clientId)) {
      this.messageQueue.set(clientId, []);
    }
    
    const queue = this.messageQueue.get(clientId)!;
    queue.push(message);
    
    // Limit queue size
    if (queue.length > 100) {
      queue.shift();
    }
  }

  /**
   * Send queued messages to client
   */
  private sendQueuedMessages(clientId: string): void {
    const queue = this.messageQueue.get(clientId);
    if (!queue || queue.length === 0) return;

    queue.forEach(message => {
      this.sendMessage(clientId, message);
    });

    this.messageQueue.delete(clientId);
    logger.info('Queued messages sent', { clientId, messageCount: queue.length });
  }

  /**
   * Send error message
   */
  private sendError(clientId: string, error: string): void {
    this.sendMessage(clientId, {
      type: MessageType.ERROR,
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Start ping interval
   */
  private startPingInterval(): void {
    setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (Date.now() - client.lastPing.getTime() > 30000) { // 30 seconds
          logger.warn('Client ping timeout', { clientId });
          client.socket.close();
        }
      });
    }, 10000); // Check every 10 seconds
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      // Clean up empty rooms
      this.rooms.forEach((roomClients, roomName) => {
        if (roomClients.size === 0) {
          this.rooms.delete(roomName);
        }
      });

      // Clean up old queued messages
      this.messageQueue.forEach((queue, clientId) => {
        if (queue.length > 0) {
          // Remove messages older than 1 hour
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          const filteredQueue = queue.filter(msg => {
            const msgTime = new Date(msg.timestamp).getTime();
            return msgTime > oneHourAgo;
          });
          
          if (filteredQueue.length === 0) {
            this.messageQueue.delete(clientId);
          } else {
            this.messageQueue.set(clientId, filteredQueue);
          }
        }
      });
    }, 60000); // Clean up every minute
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalClients: number;
    authenticatedClients: number;
    totalRooms: number;
    queuedMessages: number;
  } {
    const authenticatedClients = Array.from(this.clients.values())
      .filter(client => client.isAuthenticated).length;
    
    const queuedMessages = Array.from(this.messageQueue.values())
      .reduce((total, queue) => total + queue.length, 0);

    return {
      totalClients: this.clients.size,
      authenticatedClients,
      totalRooms: this.rooms.size,
      queuedMessages
    };
  }

  /**
   * Broadcast system status
   */
  broadcastSystemStatus(status: any): void {
    const message = {
      type: MessageType.SYSTEM_STATUS,
      status,
      timestamp: new Date().toISOString()
    };

    this.broadcastToAll(message);
  }

  /**
   * Broadcast dashboard update
   */
  broadcastDashboardUpdate(buildingId: string, data: any): void {
    const message = {
      type: MessageType.DASHBOARD_UPDATE,
      buildingId,
      data,
      timestamp: new Date().toISOString()
    };

    this.broadcastToRoom(`building:${buildingId}`, message);
  }

  /**
   * Send notification to user
   */
  sendNotification(userId: string, notification: any): void {
    const message = {
      type: MessageType.NOTIFICATION,
      notification,
      timestamp: new Date().toISOString()
    };

    this.broadcastToRoom(`user:${userId}`, message);
  }
}

/**
 * Export WebSocket service
 */
export default WebSocketService;
