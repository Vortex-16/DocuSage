'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { answerQuestion } from '@/ai/flows/answer-questions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, Message } from './chat-message';
import { SuggestedQuestions } from './suggested-questions';
import { useToast } from '@/hooks/use-toast';

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (question: string) => {
        if (!question.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), type: 'user', content: question };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setInput('');

        try {
            const result = await answerQuestion({ question });
            
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: result.answer,
                sources: result.sources,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Failed to get answer:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: "Sorry, I couldn't fetch an answer. Please try again.",
                isError: true,
            };
            setMessages(prev => [...prev, errorMessage]);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to communicate with the AI service.",
            })
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSendMessage(input);
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <ScrollArea className="flex-1 p-4 lg:p-6" ref={scrollAreaRef}>
                <div className="max-w-4xl mx-auto w-full">
                    {messages.length === 0 ? (
                        <SuggestedQuestions onQuestionSelect={handleSendMessage} />
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg) => (
                                <ChatMessage key={msg.id} {...msg} />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="border-t bg-muted/20 p-4 lg:p-6">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about internal processes, policies, and more..."
                            className="pr-20 min-h-[52px] resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(input);
                                }
                            }}
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="absolute top-1/2 right-3 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
