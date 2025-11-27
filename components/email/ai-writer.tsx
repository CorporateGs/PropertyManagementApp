"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";

interface AIWriterProps {
    onGenerate: (content: string) => void;
}

export function AIWriter({ onGenerate }: AIWriterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;

        setIsGenerating(true);
        // Mock AI generation - in a real app, this would call an API
        setTimeout(() => {
            const generatedText = `[AI Generated Draft based on: "${prompt}"]\n\nDear Tenant,\n\nWe are writing to inform you regarding the recent inquiry about ${prompt}. We have reviewed your request and would like to proceed with the necessary steps.\n\nPlease let us know if you have any further questions.\n\nBest regards,\nProperty Management Team`;
            onGenerate(generatedText);
            setIsGenerating(false);
            setIsOpen(false);
            setPrompt("");
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Draft
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Assistant</DialogTitle>
                    <DialogDescription>
                        Describe what you want to say, and let AI draft the message for you.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Textarea
                        placeholder="E.g., Write a polite reminder about the upcoming parking lot maintenance..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                    />
                    <Button onClick={handleGenerate} disabled={!prompt || isGenerating} className="w-full">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Draft
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
