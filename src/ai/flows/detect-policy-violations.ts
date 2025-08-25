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
    .describe('A brief, one-sentence explanation of the result. For example, "The document is compliant" or "The document requires updates for..."'),
  summary: z
    .string()
    .describe('A summary of policy violations detected in the document. If no violations are found, this should be an empty string.'),
});
export type DetectPolicyViolationsOutput = z.infer<
  typeof DetectPolicyViolationsOutputSchema
>;

export async function detectPolicyViolations(
  input: DetectPolicyViolationsInput
): Promise<DetectPolicyViolationsOutput> {
  const documents = await getAllDocuments();
    if (documents.length === 0) {
    return {
        needsUpdate: true,
        reason: "The knowledge base is empty.",
        summary: "Cannot check for policy violations because no policy documents have been indexed. Please add documents in the 'Data Sources' section.",
    }
  }
  const knowledgeBase = documents.map(doc => `Source: ${doc.source} - ${doc.name}\nContent: ${doc.content}`).join('\n\n');
  return detectPolicyViolationsFlow({ ...input, knowledgeBase });
}

const prompt = ai.definePrompt({
  name: 'detectPolicyViolationsPrompt',
  input: {schema: z.object({ documentText: z.string(), knowledgeBase: z.string() })},
  output: {schema: DetectPolicyViolationsOutputSchema},
  prompt: `You are an expert AI for "DocuSage", specializing in detecting policy violations in documents.

You will be provided with a text snippet and a knowledge base of company policies. Your job is to compare the document against the policies in the knowledge base and determine if it violates any of them.

1.  **Analyze the Document:** Carefully read the provided document text.
2.  **Compare with Knowledge Base:** Cross-reference the document text with the policies in the knowledge base.
3.  **Determine Compliance:**
    *   If the document violates one or more policies, set \`needsUpdate\` to \`true\`. Provide a concise, one-sentence \`reason\` for the violation. In the \`summary\` field, provide a detailed, point-by-point explanation of each violation and suggest how to correct it.
    *   If the document is fully compliant with all policies, set \`needsUpdate\` to \`false\`. Set the \`reason\` to "The document is compliant with all policies." and leave the \`summary\` field empty.

Document Text:
\`\`\`
{{{documentText}}}
\`\`\`

Knowledge Base:
\`\`\`
{{{knowledgeBase}}}
\`\`\`
`,
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
