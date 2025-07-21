import React, { useState } from 'react';
import { runGeminiAgent } from '../services/geminiService';
import { validateDocument } from '../services/validationService';
import { ProcessDocumentResponse } from '../types';

export default function PipelineDemo() {
  const [input, setInput] = useState('# Example Document\n\nThis is a test.');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function runPipeline() {
    setIsLoading(true);
    setOutput('Processing...');
    try {
      const result: ProcessDocumentResponse = await runGeminiAgent(input);
      const valid = validateDocument(result);
      setOutput(JSON.stringify(result, null, 2) + (valid ? '\n\n✅ Valid!' : '\n\n❌ Invalid!'));
    } catch (e) {
        const error = e instanceof Error ? e.message : 'Unknown error';
        setOutput(`Error: ${error}`);
    }
    setIsLoading(false);
  }

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h2 className="text-xl font-bold mb-2 text-slate-200" style={{fontFamily: 'var(--font-display)'}}>Pipeline Demo</h2>
      <p className="text-sm text-slate-400 mb-4">Test the full agent pipeline from ingestion to validation.</p>
      <textarea 
        value={input} 
        onChange={e => setInput(e.target.value)} 
        rows={8} 
        className="w-full p-2 font-mono text-sm bg-slate-900 rounded-md border border-slate-700 focus:ring-2 focus:ring-[var(--color-accent-blue)]"
      />
      <button 
        onClick={runPipeline}
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-[var(--color-accent-blue)] text-black font-bold rounded-md hover:shadow-[var(--glow-blue)] disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Running...' : 'Run Agent Pipeline'}
      </button>
      <pre className="mt-4 p-4 bg-black/50 rounded-md text-xs overflow-x-auto h-64 border border-slate-700">{output}</pre>
    </div>
  );
}
