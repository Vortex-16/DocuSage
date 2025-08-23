'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoaderCircle, AlertTriangle, CheckCircle2, Wand2 } from 'lucide-react';
import { detectPolicyViolations, DetectPolicyViolationsOutput } from '@/ai/flows/detect-policy-violations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function PolicyCheckTool() {
    const [documentText, setDocumentText] = useState('');
    const [result, setResult] = useState<DetectPolicyViolationsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCheckPolicy = async () => {
        if (!documentText.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Document text cannot be empty.',
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const res = await detectPolicyViolations({ documentText });
            setResult(res);
        } catch (error) {
            console.error('Policy check failed:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to perform policy check. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Document Policy Check</CardTitle>
                    <CardDescription>
                        Paste your document text below to check for policy violations against the knowledge base.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Paste your document content here..."
                        value={documentText}
                        onChange={(e) => setDocumentText(e.target.value)}
                        className="min-h-[300px] text-sm"
                        disabled={isLoading}
                    />
                    <Button onClick={handleCheckPolicy} disabled={isLoading || !documentText.trim()}>
                        {isLoading ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Check Policy
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Analysis Result</CardTitle>
                    <CardDescription>
                        The results of the policy check will appear here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <LoaderCircle className="h-8 w-8 animate-spin" />
                            <p>Analyzing document...</p>
                        </div>
                    ) : result ? (
                        <div className="w-full space-y-4">
                            <div className={cn("flex items-start gap-3 rounded-lg p-4 border", 
                                result.needsUpdate ? "border-amber-500/50 bg-amber-500/10" : "border-green-500/50 bg-green-500/10"
                            )}>
                                {result.needsUpdate ? (
                                    <AlertTriangle className="h-5 w-5 mt-1 text-amber-500" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 mt-1 text-green-500" />
                                )}
                                <div>
                                    <h3 className={cn("font-semibold", result.needsUpdate ? "text-amber-600" : "text-green-600")}>
                                        {result.needsUpdate ? "Updates Required" : "Policy Compliant"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{result.reason}</p>
                                </div>
                            </div>
                            
                            {result.needsUpdate && (
                                <>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Summary of Violations</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
                                </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <p>No analysis has been performed yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
