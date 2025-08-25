// This file uses server-side code.
'use server';

/**
 * @fileOverview A question answering AI agent for internal documents.
 *
 * - answerQuestion - A function that answers questions about internal documents.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllDocuments } from '@/ai/knowledge-base';

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe('The question to answer.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
  sources: z.array(z.string()).describe('The sources used to answer the question. Provide the document name as the source.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  const documents = await getAllDocuments();
  if (documents.length === 0) {
    return {
        answer: "I couldn't find any documents in the knowledge base. Please add a data source first.",
        sources: []
    }
  }
  const context = documents.map(doc => `Source: ${doc.source} - ${doc.name}\nContent: ${doc.content}`).join('\n\n');
  
  return answerQuestionFlow({ ...input, context });
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: z.object({ question: z.string(), context: z.string() })},
  output: {schema: AnswerQuestionOutputSchema},
  prompt: `You are an AI assistant for "DocuSage", designed to answer questions about internal company documents.

You will be given a user's question and a set of internal documents as context. Your task is to provide a clear and concise answer to the question based ONLY on the information present in the provided documents.

Carefully analyze the documents and the question. Synthesize the relevant information to formulate your answer.

When you provide an answer, you MUST cite the specific document names you used to formulate your response. List these under the 'sources' field.

If the information required to answer the question is not available in the provided documents, you MUST explicitly state that you could not find an answer in the knowledge base. Do not try to make up an answer.

Question: {{{question}}}

Documents:
{{{context}}}`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: z.object({ question: z.string(), context: z.string() }),
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
