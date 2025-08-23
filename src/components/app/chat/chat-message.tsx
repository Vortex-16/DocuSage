'use client';

import { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown, Book, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    sources?: string[];
    isError?: boolean;
}

export function ChatMessage({ type, content, sources, isError }: Message) {
    const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);

    const isUser = type === 'user';

    return (
        <div className={cn('flex items-start gap-4', isUser && 'justify-end')}>
            {!isUser && (
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback className={cn(isError && 'bg-destructive text-destructive-foreground')}>
                        <Bot className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                'max-w-[75%] space-y-2',
                isUser ? 'items-end' : 'items-start'
            )}>
                <div className={cn(
                    'rounded-lg p-3 text-sm whitespace-pre-wrap',
                    isUser
                        ? 'bg-primary text-primary-foreground'
                        : isError 
                        ? 'bg-destructive/10 border border-destructive/20 text-destructive-foreground' 
                        : 'bg-muted/50',
                )}>
                    <p>{content}</p>
                </div>
                {!isUser && sources && sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground self-center">Sources:</span>
                        {sources.map((source, index) => (
                            <a href="#" key={index} target="_blank" rel="noopener noreferrer">
                                <Badge variant="secondary" className="hover:bg-muted cursor-pointer">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {source}
                                </Badge>
                            </a>
                        ))}
                    </div>
                )}
                {!isUser && !isError && (
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">Did you find this answer helpful?</p>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-7 w-7", feedback === 'good' && "bg-accent text-accent-foreground")}
                            onClick={() => setFeedback('good')}
                        >
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-7 w-7", feedback === 'bad' && "bg-accent text-accent-foreground")}
                            onClick={() => setFeedback('bad')}
                        >
                            <ThumbsDown className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {isUser && (
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
