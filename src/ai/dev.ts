import { config } from 'dotenv';
config();

import '@/ai/flows/answer-questions.ts';
import '@/ai/flows/index-team-documents.ts';
import '@/ai/flows/detect-policy-violations.ts';