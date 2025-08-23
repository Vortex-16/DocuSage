'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const questions = [
    "What's our refund policy?",
    "How to request design assets?",
    "What are the company holidays for this year?",
    "Where can I find the brand guidelines?",
];

interface SuggestedQuestionsProps {
    onQuestionSelect: (question: string) => void;
}

export function SuggestedQuestions({ onQuestionSelect }: SuggestedQuestionsProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Welcome to DocuSage</h1>
                <p className="text-muted-foreground">Your intelligent assistant for internal knowledge.</p>
            </div>
            
            <Card className="w-full max-w-lg text-left">
                <CardHeader>
                    <CardTitle>Try asking</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {questions.map((q) => (
                            <li key={q}>
                                <button
                                    onClick={() => onQuestionSelect(q)}
                                    className="w-full flex justify-between items-center p-3 rounded-md hover:bg-muted/50 transition-colors text-sm"
                                >
                                    <span>{q}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
