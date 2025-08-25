'use server';

/**
 * @fileOverview Implements the policy violation detection flow.
 *
 * - detectPolicyViolations - A function that detects policy violations in a document.
 * - DetectPolicyViolationsInput - The input type for the detectPolicyViolations function.
 * - DetectPolicyViolationsOutput - The return type for the detectPolicyViolations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllDocuments } from '@/ai/knowledge-base';

const DetectPolicyViolationsInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to check for policy violations.'),
});
export type DetectPolicyViolationsInput = z.infer<
  typeof DetectPolicyViolationsInputSchema
>;

const DetectPolicyViolationsOutputSchema = z.object({
  needsUpdate: z
    .boolean()
    .describe('Whether the document needs to be updated to conform to policy.'),
  reason: z
    .string()
    .describe('The reason why the document needs to be updated.'),
  summary: z
    .string()
    .describe('A summary of policy violations detected in the document'),
});
export type DetectPolicyViolationsOutput = z.infer<
  typeof DetectPolicyViolationsOutputSchema
>;

export async function detectPolicyViolations(
  input: DetectPolicyViolationsInput
): Promise<DetectPolicyViolationsOutput> {
  const documents = await getAllDocuments();
  const knowledgeBase = documents.map(doc => `Source: ${doc.source} - ${doc.name}\nContent: ${doc.content}`).join('\n\n');
  return detectPolicyViolationsFlow({ ...input, knowledgeBase });
}

const prompt = ai.definePrompt({
  name: 'detectPolicyViolationsPrompt',
  input: {schema: z.object({ documentText: z.string(), knowledgeBase: z.string() })},
  output: {schema: DetectPolicyViolationsOutputSchema},
  prompt: `You are an expert in detecting policy violations in documents.

You will be provided with the text content of a document. You must compare it against our current knowledge base of policies and determine if it needs to be updated to conform to policy. If so, explain why and provide a summary of the violations. Use the needsUpdate output field to indicate whether the document needs to be updated. If the document is compliant, state that clearly.

Document Text: {{{documentText}}}

Knowledge Base:
{{{knowledgeBase}}}`,
});

const detectPolicyViolationsFlow = ai.defineFlow(
  {
    name: 'detectPolicyViolationsFlow',
    inputSchema: z.object({ documentText: z.string(), knowledgeBase: z.string() }),
    outputSchema: DetectPolicyViolationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
