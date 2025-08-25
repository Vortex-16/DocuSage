'use server';

/**
 * @fileOverview This file defines a Genkit flow for indexing team documents from various sources.
 *
 * The flow takes document source information as input and returns a success boolean.
 *
 * @example
 * // Example usage:
 * const result = await indexTeamDocuments({
 *   documentSource: 'Notion',
 *   apiKey: 'your_notion_api_key',
 *   documentContent: 'The content of the document to index.',
 *   documentName: 'Document Name'
 * });
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addDocument } from '@/ai/knowledge-base';

const IndexTeamDocumentsInputSchema = z.object({
  documentSource: z
    .string()
    .describe('The source of the document. Can be Notion, Google Docs, or Confluence.'),
  apiKey: z.string().describe('The API key for accessing the document source. (Simulated)'),
  documentName: z.string().describe('The name or title of the document.'),
  documentContent: z.string().describe('The text content of the document to index.'),
});
export type IndexTeamDocumentsInput = z.infer<typeof IndexTeamDocumentsInputSchema>;

const IndexTeamDocumentsOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the document indexing was successful.'),
});
export type IndexTeamDocumentsOutput = z.infer<typeof IndexTeamDocumentsOutputSchema>;

export async function indexTeamDocuments(input: IndexTeamDocumentsInput): Promise<IndexTeamDocumentsOutput> {
  return indexTeamDocumentsFlow(input);
}

const indexTeamDocumentsFlow = ai.defineFlow(
  {
    name: 'indexTeamDocumentsFlow',
    inputSchema: IndexTeamDocumentsInputSchema,
    outputSchema: IndexTeamDocumentsOutputSchema,
  },
  async input => {
    console.log(`Indexing document "${input.documentName}" from ${input.documentSource}.`);

    try {
      await addDocument({
        source: input.documentSource as any,
        name: input.documentName,
        content: input.documentContent,
        lastIndexed: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to index document:", error);
      return { success: false };
    }
  }
);
