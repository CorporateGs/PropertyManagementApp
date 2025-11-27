'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, MessageSquare, Phone, FileText, ArrowLeft, Sparkles } from 'lucide-react';

const serviceConfig: Record<string, any> = {
    WEBSITE: {
        name: 'Website',
        icon: Globe,
        color: 'blue',
        fields: [
            { name: 'businessName', label: 'Business Name', type: 'text', required: true },
            { name: 'industry', label: 'Industry', type: 'text', required: true },
            { name: 'style', label: 'Design Style', type: 'select', options: ['modern', 'classic', 'minimal'], required: true },
            { name: 'pages', label: 'Pages Needed', type: 'textarea', placeholder: 'e.g., Home, About, Services, Contact', required: true },
            { name: 'features', label: 'Features', type: 'textarea', placeholder: 'e.g., Blog, Contact Form, E-commerce', required: false },
            { name: 'brandColors', label: 'Brand Colors', type: 'text', placeholder: 'e.g., #3B82F6, #10B981', required: false },
            { name: 'content', label: 'Additional Info', type: 'textarea', required: false },
        ]
    },
    CHATBOT: {
        name: 'AI Chatbot',
        icon: MessageSquare,
        color: 'purple',
        fields: [
            { name: 'businessName', label: 'Business Name', type: 'text', required: true },
            { name: 'industry', label: 'Industry', type: 'text', required: true },
            { name: 'knowledgeBase', label: 'Knowledge Base / FAQs', type: 'textarea', placeholder: 'Paste your FAQs, product info, or business details', required: true },
            { name: 'personality', label: 'Chatbot Personality', type: 'select', options: ['professional', 'friendly', 'casual'], required: true },
            { name: 'languages', label: 'Languages', type: 'text', placeholder: 'e.g., English, Spanish', required: false },
        ]
    },
    PHONE_ASSISTANT: {
        name: 'Phone Assistant',
        icon: Phone,
        color: 'green',
        fields: [
            { name: 'businessName', label: 'Business Name', type: 'text', required: true },
            { name: 'greeting', label: 'Greeting Message', type: 'textarea', placeholder: 'e.g., Thank you for calling ABC Company...', required: true },
            { name: 'services', label: 'Services Offered', type: 'textarea', placeholder: 'List your services', required: true },
            { name: 'businessHours', label: 'Business Hours', type: 'text', placeholder: 'e.g., Mon-Fri 9AM-5PM', required: true },
            { name: 'voiceType', label: 'Voice Type', type: 'select', options: ['male', 'female'], required: true },
        ]
    },
    TAX_PREP: {
        name: 'Tax Preparation',
        icon: FileText,
        color: 'orange',
        fields: [
            { name: 'taxYear', label: 'Tax Year', type: 'text', placeholder: '2024', required: true },
            { name: 'filingStatus', label: 'Filing Status', type: 'select', options: ['single', 'married_joint', 'married_separate', 'head_of_household'], required: true },
            { name: 'income', label: 'Income Sources', type: 'textarea', placeholder: 'W-2, 1099, etc.', required: true },
            { name: 'deductions', label: 'Deductions', type: 'textarea', placeholder: 'List any deductions', required: false },
            { name: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
        ]
    },
};

export default function NewOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const serviceType = searchParams.get('service') || 'WEBSITE';
    const config = serviceConfig[serviceType];
    const Icon = config.icon;

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const missingFields = config.fields
            .filter((f: any) => f.required && !formData[f.name])
            .map((f: any) => f.label);

        if (missingFields.length > 0) {
            toast({
                title: 'Missing Required Fields',
                description: `Please fill in: ${missingFields.join(', ')}`,
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceType,
                    requirements: formData,
                    priority: 5
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Order Created!',
                    description: 'Your AI agent will start working on this immediately.',
                });
                router.push(`/ai-orders/${data.data.id}`);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create order. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className={`p-4 bg-${config.color}-100 dark:bg-${config.color}-900 rounded-lg`}>
                                <Icon className={`h-8 w-8 text-${config.color}-600 dark:text-${config.color}-400`} />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Order {config.name}</CardTitle>
                                <CardDescription>
                                    AI will build this automatically - just provide the details
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {config.fields.map((field: any) => (
                                <div key={field.name} className="space-y-2">
                                    <Label htmlFor={field.name}>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>

                                    {field.type === 'text' && (
                                        <Input
                                            id={field.name}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                            required={field.required}
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <Textarea
                                            id={field.name}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                            required={field.required}
                                            rows={4}
                                        />
                                    )}

                                    {field.type === 'select' && (
                                        <Select
                                            value={formData[field.name]}
                                            onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
                                            required={field.required}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Select ${field.label}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options.map((option: string) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option.replace('_', ' ').toUpperCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}

                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                                            Creating Order...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5 mr-2" />
                                            Submit to AI Agent
                                        </>
                                    )}
                                </Button>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                                    Your dedicated AI agent will start working immediately
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
