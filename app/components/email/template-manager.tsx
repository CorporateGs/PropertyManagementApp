"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Check } from "lucide-react";

interface Template {
    id: string;
    title: string;
    subject: string;
    content: string;
    category: "Tenant" | "Contractor" | "Compliance" | "Emergency";
}

const defaultTemplates: Template[] = [
    {
        id: "t1",
        title: "Lease Renewal Notice",
        subject: "Important: Lease Renewal Discussion",
        content: "Dear [Tenant Name],\n\nWe hope you are enjoying your stay at [Property Name]. Your lease is set to expire on [Date]. We would love to have you stay with us. Please let us know if you are interested in renewing your lease.\n\nBest regards,\nProperty Management",
        category: "Tenant",
    },
    {
        id: "t2",
        title: "Rent Late Notice",
        subject: "Overdue Rent Payment Notification",
        content: "Dear [Tenant Name],\n\nThis is a reminder that we have not received your rent payment for [Month]. Please submit your payment immediately to avoid late fees.\n\nSincerely,\nProperty Management",
        category: "Tenant",
    },
    {
        id: "c1",
        title: "Work Order Assignment",
        subject: "New Work Order: [Work Order ID]",
        content: "Hello [Contractor Name],\n\nA new work order has been assigned to you at [Address]. Please review the details in the portal and confirm your availability.\n\nThank you,\nProperty Management",
        category: "Contractor",
    },
    {
        id: "comp1",
        title: "Annual Safety Inspection",
        subject: "Notice of Annual Safety Inspection",
        content: "Dear Residents,\n\nWe will be conducting our annual safety inspection on [Date] between [Time]. Please ensure access to your unit is available.\n\nThank you for your cooperation,\nProperty Management",
        category: "Compliance",
    },
];

interface TemplateManagerProps {
    onSelectTemplate: (template: Template) => void;
}

export function TemplateManager({ onSelectTemplate }: TemplateManagerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (template: Template) => {
        onSelectTemplate(template);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Templates
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Communication Templates</DialogTitle>
                    <DialogDescription>
                        Select a pre-built template to quickly draft your message.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="Tenant" className="w-full h-full flex flex-col">
                    <TabsList>
                        <TabsTrigger value="Tenant">Tenant</TabsTrigger>
                        <TabsTrigger value="Contractor">Contractor</TabsTrigger>
                        <TabsTrigger value="Compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="Emergency">Emergency</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="flex-1 mt-4">
                        {["Tenant", "Contractor", "Compliance", "Emergency"].map((category) => (
                            <TabsContent key={category} value={category} className="space-y-4">
                                {defaultTemplates
                                    .filter((t) => t.category === category)
                                    .map((template) => (
                                        <Card key={template.id} className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => handleSelect(template)}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{template.title}</CardTitle>
                                                <CardDescription>{template.subject}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {template.content}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                {defaultTemplates.filter((t) => t.category === category).length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No templates found for this category.
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
