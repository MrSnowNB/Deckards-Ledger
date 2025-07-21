import React, { useState } from 'react';
import { SparklesIcon, LoaderIcon } from './Icons';

interface IngestionViewProps {
  onProcess: (text: string) => void;
  isLoading: boolean;
}

const placeholderText = `# My Awesome Project

## 1. Introduction

Welcome to the documentation for this awesome project. This document outlines the key features, architecture, and deployment strategy. Our goal is to create a scalable and maintainable system that can evolve over time.

This section provides a high-level overview.

## 2. Core Architecture

The system is built using a microservices architecture. Each service is responsible for a specific business capability.

### 2.1 API Gateway

The API Gateway is the single entry point for all clients. It handles request routing, composition, and protocol translation. It communicates with the downstream services.

### 2.2 User Service

Manages user authentication, authorization, and profiles. It uses JWT for secure sessions.

## 3. Data Model

Our data model is designed for flexibility. We use a combination of relational and NoSQL databases to best fit the data access patterns of each service. The main entities are Users, Projects, and Tasks.

...paste your full document here...
`;

export const IngestionView: React.FC<IngestionViewProps> = ({ onProcess, isLoading }) => {
  const [text, setText] = useState(placeholderText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onProcess(text);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-900/70 rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-accent-purple)]/30 backdrop-blur-sm" style={{ boxShadow: 'var(--glow-purple)'}}>
        <div className="p-6 sm:p-8 text-center border-b border-[var(--color-accent-purple)]/20">
          {/* Synapse Codex rebrand: Update title and add tagline */}
          <h1 
            className="text-4xl sm:text-6xl font-black text-white" 
            style={{ fontFamily: 'var(--font-display)', textShadow: 'var(--glow-blue)' }}
          >
            SYNAPSE CODEX
          </h1>
          <p 
            className="mt-4 text-base sm:text-lg text-[var(--color-accent-blue)]/80"
            style={{ textShadow: '0 0 3px rgba(36, 254, 254, 0.4)'}}
          >
            Document the Future. Orchestrate the Agents.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <label htmlFor="document-input" className="block text-sm font-medium text-slate-400 mb-2">
            Paste your Markdown or plain-text document below
          </label>
          <textarea
            id="document-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-80 p-4 border border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-[var(--color-accent-blue)] transition duration-150 ease-in-out text-sm font-mono bg-black/50 text-slate-200"
            style={{boxShadow: 'var(--glow-blue)'}}
            placeholder="Paste your document here..."
          />
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-md text-black hover:shadow-[var(--glow-purple)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-purple)] transition-shadow animated-gradient animated-gradient-primary disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="w-5 h-5 mr-3" />
                  Processing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-3" />
                  Generate Living Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
       <footer className="mt-8 text-center text-sm text-slate-500">
          <p>Powered by Google Gemini. All processing is done in your browser.</p>
        </footer>
    </div>
  );
};