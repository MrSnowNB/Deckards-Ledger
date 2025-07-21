import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MiniFile, Status, DependencyStatus, Job, ProcessingTask, JobStatus } from '../types';
import { CheckSquareIcon, HistoryIcon, FileTextIcon, AlertTriangleIcon, SendIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

interface MiniFileViewProps {
  file: MiniFile | null;
  onMarkComplete: (fileId: string) => void;
  onIntegrateJob: (job: Job) => void;
}

const JobExportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    jobJson: string;
    onIntegrate: (completedJobJson: string) => void;
}> = ({ isOpen, onClose, jobJson, onIntegrate }) => {
    const [completedJob, setCompletedJob] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(jobJson).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
        });
    };

    const handleIntegrateClick = () => {
        if (completedJob.trim()) {
            onIntegrate(completedJob);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--color-bg-light)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--color-accent-blue)]/50" style={{boxShadow: 'var(--glow-blue)'}}>
                <div className="p-4 border-b border-[var(--color-accent-blue)]/20 flex justify-between items-center animated-gradient animated-gradient-blue">
                    <h2 className="text-lg font-bold text-black" style={{fontFamily: 'var(--font-display)'}}>Agent Job Round-trip</h2>
                    <button onClick={onClose} className="text-black/70 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">1. Export Job for Agent</label>
                        <p className="text-xs text-slate-500 mb-2">Copy this JSON and send it to your local or remote agent for processing.</p>
                        <div className="relative">
                            <textarea
                                readOnly
                                value={jobJson}
                                className="w-full h-40 p-2 border border-slate-700 rounded-md bg-slate-900/80 font-mono text-xs text-slate-300"
                            />
                            <button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-200">
                                {copySuccess || 'Copy'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="completed-job-input" className="block text-sm font-medium text-slate-300 mb-1">2. Import Completed Job</label>
                         <p className="text-xs text-slate-500 mb-2">After the agent finishes, paste the returned Job JSON here to integrate the results.</p>
                        <textarea
                            id="completed-job-input"
                            value={completedJob}
                            onChange={(e) => setCompletedJob(e.target.value)}
                            className="w-full h-40 p-2 border border-slate-700 rounded-md font-mono text-xs bg-slate-900/80 text-slate-300 focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-[var(--color-accent-blue)]"
                            placeholder='Paste the completed Job JSON from the agent here...'
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-[var(--color-accent-blue)]/20 bg-black/30 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-transparent rounded-md hover:bg-slate-600">
                        Cancel
                    </button>
                    <button 
                        onClick={handleIntegrateClick}
                        disabled={!completedJob.trim()}
                        className="px-4 py-2 text-sm font-bold text-black bg-[var(--color-accent-blue)] rounded-md hover:shadow-[var(--glow-blue)] disabled:bg-slate-700 disabled:text-slate-400 transition-shadow animated-gradient animated-gradient-blue"
                    >
                        Integrate Job Result
                    </button>
                </div>
            </div>
        </div>
    );
};


export const MiniFileView: React.FC<MiniFileViewProps> = ({ file, onMarkComplete, onIntegrateJob }) => {
  const [isJobModalOpen, setJobModalOpen] = useState(false);
  const [pulseLastRow, setPulseLastRow] = useState(false);
  const trailLengthRef = useRef(0);

  useEffect(() => {
    if (file) {
      if (file.verificationTrail.length > trailLengthRef.current) {
        setPulseLastRow(true);
        const timer = setTimeout(() => setPulseLastRow(false), 1500); // Animation duration
        return () => clearTimeout(timer);
      }
      trailLengthRef.current = file.verificationTrail.length;
    }
  }, [file?.verificationTrail]);
  
  if (!file) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center h-full">
        <div className="text-center text-slate-500">
            <FileTextIcon className="mx-auto w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-500" style={{fontFamily: 'var(--font-display)'}}>No File Selected</h3>
            <p className="text-slate-600">Select a mini-file from the index to view its details.</p>
        </div>
      </div>
    );
  }
  
  const yamlProvenance = file.provenance 
    ? `
  agent: ${file.provenance.agent}
  completed_at: ${file.provenance.completedAt}`
    : ' null';

  const yamlVerificationTrail = file.verificationTrail.length > 0
    ? file.verificationTrail.map(v => 
`  - agent: ${v.agent}
    timestamp: ${v.timestamp}
    status: ${v.status}${v.notes ? `\n    notes: "${v.notes}"` : ''}`
      ).join('\n')
    : ' []';

  const yamlContent = `---
id: ${file.id}
parent_id: ${file.parentId}
hash: ${file.hash}
version: ${file.version}
created: ${file.created}
tokens: ${file.tokens}
status: ${file.status}
agent_hint: "${file.agentHint}"
modalities: [${file.modalities.join(', ')}]
dependencies: [${file.dependencies.join(', ')}]
dependency_status: ${file.dependencyStatus}
provenance:${yamlProvenance}
verification_trail:
${yamlVerificationTrail}
---`;
    
  const createJob = (): Job => ({
    jobId: uuidv4(),
    task: 'rewrite_section', // Example task
    jobStatus: 'pending',
    miniFile: file,
    output: null,
    error: null,
    agentMetadata: {
        agentId: 'local-llm-runner',
        model: 'ollama/llama3'
    }
  });
  
  const handleIntegrateJob = (completedJobJson: string) => {
    try {
        const completedJob = JSON.parse(completedJobJson);
        // Basic validation
        if (completedJob.jobId && completedJob.miniFile && completedJob.output) {
            onIntegrateJob(completedJob);
            setJobModalOpen(false);
        } else {
            alert("Invalid Job JSON. Make sure it has jobId, miniFile, and output properties.");
        }
    } catch(e) {
        alert("Failed to parse JSON. Please check the format.");
        console.error(e);
    }
  };


  return (
    <>
    <JobExportModal 
        isOpen={isJobModalOpen}
        onClose={() => setJobModalOpen(false)}
        jobJson={JSON.stringify(createJob(), null, 2)}
        onIntegrate={handleIntegrateJob}
    />
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="bg-slate-900/70 rounded-lg shadow-lg border border-slate-800 overflow-hidden">
        {file.dependencyStatus === DependencyStatus.OutOfDate && (
             <div className="p-4 bg-amber-900/50 border-b border-amber-500/30 text-amber-300 text-sm">
                <div className="flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p><strong>Dependency Out of Date:</strong> A parent chunk has been updated. This file may need to be re-processed and verified again.</p>
                </div>
            </div>
        )}
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-accent-blue)] break-all" style={{fontFamily: 'var(--font-display)'}}>{file.id}</h3>
        </div>
        <div className="p-6">
            <div className="bg-black/50 rounded-md p-4 mb-6 font-mono text-xs text-slate-400 overflow-x-auto border border-slate-700">
                <pre><code>{yamlContent}</code></pre>
            </div>
            
            <div className="prose prose-invert max-w-none prose-headings:text-slate-200 prose-headings:border-b-slate-700 prose-a:text-[var(--color-accent-blue)] hover:prose-a:text-[var(--color-accent-blue)] hover:prose-a:underline prose-strong:text-slate-100 prose-code:text-[var(--color-accent-magenta)] prose-code:bg-slate-800/50 prose-code:p-1 prose-code:rounded-sm">
                <div dangerouslySetInnerHTML={{ __html: file.content.replace(/\n/g, '<br />') }} />

                <h3 className="!text-slate-100 !font-bold" style={{fontFamily: 'var(--font-display)'}}>### Verification</h3>
                <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-300 font-medium">Agent Hint:</p>
                    <p className="text-sm text-slate-400 mt-1 italic">"{file.agentHint}"</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {file.status === Status.Complete ? (
                            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-300 bg-green-900/50">
                                <CheckSquareIcon className="w-5 h-5 mr-2" />
                                Task Completed
                            </div>
                        ) : (
                             <button
                                onClick={() => onMarkComplete(file.id)}
                                className="inline-flex items-center px-4 py-2 border border-[var(--color-accent-green)] text-sm font-bold rounded-md text-[var(--color-accent-green)] bg-transparent hover:bg-[var(--color-accent-green)] hover:text-black hover:shadow-[var(--glow-green)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-green)] transition-all"
                            >
                                <CheckSquareIcon className="w-5 h-5 mr-2" />
                                Mark as Complete
                            </button>
                        )}
                         <button
                            onClick={() => setJobModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-black animated-gradient animated-gradient-purple bg-[var(--color-accent-purple)] hover:shadow-[var(--glow-purple)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-purple)] transition-shadow"
                        >
                            <SendIcon className="w-5 h-5 mr-2" />
                            Create Processing Job
                        </button>
                    </div>
                </div>

                <h3 className="!text-slate-100 !font-bold flex items-center gap-2 mt-8" style={{fontFamily: 'var(--font-display)'}}>
                  <HistoryIcon className="w-5 h-5 text-slate-500" />
                  ### Verification Trail
                </h3>
                <div className="mt-4 overflow-x-auto border border-slate-700 rounded-lg">
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/70">
                            <tr>
                                <th scope="col" className="px-4 py-2 font-medium">Agent</th>
                                <th scope="col" className="px-4 py-2 font-medium">Timestamp</th>
                                <th scope="col" className="px-4 py-2 font-medium">Status</th>
                                <th scope="col" className="px-4 py-2 font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {file.verificationTrail.length > 0 ? (
                                file.verificationTrail.map((step, index) => (
                                    <tr 
                                        key={index}
                                        className={`bg-transparent transition-all duration-200 border-y border-y-transparent hover:border-y-[var(--color-accent-blue)]/50 hover:bg-slate-800/50 ${
                                            pulseLastRow && index === file.verificationTrail.length - 1 ? 'animate-pulse-blue' : ''
                                        }`}
                                    >
                                        <td className="px-4 py-2 font-medium text-slate-200">{step.agent}</td>
                                        <td className="px-4 py-2 text-slate-400">{new Date(step.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                step.status === 'pass' ? 'bg-green-900/70 text-green-300' :
                                                step.status === 'fail' ? 'bg-red-900/70 text-red-300' :
                                                'bg-slate-700 text-slate-300'
                                            }`}>
                                                {step.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 italic text-slate-500">{step.notes}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="bg-transparent">
                                    <td colSpan={4} className="px-4 py-4 text-center text-slate-500">No verification steps recorded.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
      </div>
    </div>
    </>
  );
};