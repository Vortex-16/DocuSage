// This file uses server-side code.
'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * @fileoverview A simple file-based knowledge base for storing and retrieving indexed documents.
 * In a production application, this would be replaced with a proper vector database like Pinecone or ChromaDB.
 */

type Document = {
  id: string;
  source: 'Notion' | 'Google Docs' | 'Confluence';
  name: string;
  content: string;
  lastIndexed: string;
};

// Use a temporary file to store the knowledge base.
const DB_PATH = path.join(process.cwd(), '.tmp', 'knowledge-base.json');

async function ensureDbFile(): Promise<void> {
    try {
        await fs.access(path.dirname(DB_PATH));
    } catch {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    }
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.writeFile(DB_PATH, JSON.stringify([]), 'utf-8');
    }
}

async function readDb(): Promise<Document[]> {
    await ensureDbFile();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function writeDb(data: Document[]): Promise<void> {
    await ensureDbFile();
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function addDocument(doc: Omit<Document, 'id'>): Promise<Document> {
  const documents = await readDb();
  const newDoc = { ...doc, id: Date.now().toString() };
  documents.push(newDoc);
  await writeDb(documents);
  return newDoc;
}

export async function getAllDocuments(): Promise<Document[]> {
  return await readDb();
}

export async function getDocumentById(id: string): Promise<Document | undefined> {
    const documents = await readDb();
    return documents.find(doc => doc.id === id);
}

// Used to populate initial data and clear the store.
export async function initializeKnowledgeBase(initialData: Omit<Document, 'id'>[]): Promise<void> {
    const documents = initialData.map(doc => ({ ...doc, id: Date.now().toString() + Math.random() }));
    await writeDb(documents);
}
