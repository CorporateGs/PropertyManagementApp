"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";

// Types
interface Message {
  id: string;
  message: string;
  response?: string;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  suggestedActions?: Array<{
    type: string;
    label: string;
    description: string;
  }>;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export default function AIAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      const response = await fetch("/api/ai/chat");

      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setConversations(data.data);
      } else {
        throw new Error(data.error?.message || "Failed to load conversations");
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    }
  };

  // Load specific conversation
  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai/chat/${conversationId}`);

      if (!response.ok) {
        throw new Error(`Failed to load conversation: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCurrentConversationId(conversationId);
        setMessages(data.data.messages);
      } else {
        throw new Error(data.error?.message || "Failed to load conversation");
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: inputMessage,
          context: {
            userType: "STAFF", // This should be derived from current user
            currentPage: "ai-assistant",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const aiResponse: Message = {
          id: data.data.messageId,
          message: inputMessage,
          response: data.data.response,
          intent: data.data.intent,
          sentiment: data.data.sentiment,
          confidence: data.data.confidence,
          suggestedActions: data.data.suggestedActions,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiResponse]);

        // Update conversation ID if this is a new conversation
        if (!currentConversationId && data.data.conversationId) {
          setCurrentConversationId(data.data.conversationId);
          loadConversations(); // Refresh conversations list
        }
      } else {
        throw new Error(data.error?.message || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");

      // Add error message to chat
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        message: inputMessage,
        response: "Sorry, I encountered an error processing your message. Please try again.",
        intent: "ERROR",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle suggested action click
  const handleSuggestedAction = (action: { type: string; label: string }) => {
    // This could trigger navigation or other actions
    toast.info(`Action: ${action.label}`);
  };

  // Start new conversation
  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInputMessage("");
    inputRef.current?.focus();
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[600px] gap-4">
      {/* Conversations Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Button size="sm" onClick={startNewConversation}>
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => loadConversation(conversation.id)}
                >
                  <div className="font-medium text-sm truncate">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conversation.messages.length} messages
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(conversation.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Property Management Assistant
            <Sparkles className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your AI assistant</p>
                  <p className="text-sm">Ask me about tenants, payments, maintenance, or any property management questions.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="space-y-3">
                    {/* User Message */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    {message.response && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                            <p className="text-sm">{message.response}</p>

                            {/* Intent and Sentiment */}
                            {(message.intent || message.sentiment) && (
                              <div className="flex gap-2 mt-2">
                                {message.intent && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.intent.replace("_", " ")}
                                  </Badge>
                                )}
                                {message.sentiment && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.sentiment}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Suggested Actions */}
                            {message.suggestedActions && message.suggestedActions.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Suggested Actions:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {message.suggestedActions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-7"
                                      onClick={() => handleSuggestedAction(action)}
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask me anything about property management..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
