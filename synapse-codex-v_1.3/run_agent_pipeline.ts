import { runGeminiAgent } from './services/geminiService';
import { validateDocument } from './services/validationService';
import { ProcessDocumentResponse } from './types';

async function orchestratePipeline(docContent: string) {
  console.log('Running agent pipeline...');
  try {
    const agentResult: ProcessDocumentResponse = await runGeminiAgent(docContent);
    const isValid = validateDocument(agentResult);
    console.log('=== AGENT RESULT ===');
    console.log(JSON.stringify(agentResult, null, 2));
    console.log(isValid ? '✅ Valid!' : '❌ Invalid!');
  } catch (error) {
    console.error("Pipeline failed:", error);
  }
}

const exampleDoc = '# Sample Document\nHello agent!';
orchestratePipeline(exampleDoc);
