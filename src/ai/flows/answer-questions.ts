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
  sources: z.array(z.string()).describe('The sources used to answer the question.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  const documents = await getAllDocuments();
  const context = documents.map(doc => `Source: ${doc.source} - ${doc.name}\nContent: ${doc.content}`).join('\n\n');
  
  return answerQuestionFlow({ ...input, context });
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: z.object({ question: z.string(), context: z.string() })},
  output: {schema: AnswerQuestionOutputSchema},
  prompt: `You are an AI assistant answering questions about internal company documents.

  You are given a question and a set of relevant documents from the knowledge base.

  Answer the question using ONLY the information in the documents provided.

  Cite the sources used to answer the question. If the document content does not contain the answer, say that you could not find an answer in the knowledge base.

  Question: {{{question}}}

  Documents: {{{context}}}`,
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
