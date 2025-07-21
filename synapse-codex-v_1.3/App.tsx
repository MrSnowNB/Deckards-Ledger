
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Components
import { IngestionView } from './components/IngestionView';
import { LivingDocumentView } from './components/LivingDocumentView';
import { MiniFileView } from './components/MiniFileView';
import { DebugTerminal } from './components/DebugTerminal';
import { BootScreen } from './components/BootScreen';
import { AliceWonderland } from './components/AliceWonderland';
import PipelineDemo from './components/PipelineDemo';
import { FileTextIcon } from './components/Icons';

// Services
import { runGeminiAgent } from './services/geminiService';
import { validateMiniFile } from './services/validationService';
import { masterDocument, FileChange } from './services/MasterDocument';

// Types
import { MiniFile, Status, DependencyStatus, LogEntry, Toast, Job } from './types';

const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2">
        {toasts.map(toast => (
            <div key={toast.id} className={`rounded-md shadow-lg p-4 border ${toast.type === 'success' ? 'bg-green-800/90 border-green-500' : 'bg-red-800/90 border-red-500'} animate-fade-in-right`}>
                <p className="text-sm font-medium text-white">{toast.message}</p>
            </div>
        ))}
    </div>
);

// Main App Component
const App: React.FC = () => {
    // State
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [projectSummary, setProjectSummary] = useState<string>('');
    const [miniFiles, setMiniFiles] = useState<MiniFile[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [showBootScreen, setShowBootScreen] = useState<boolean>(true);
    const [showAlice, setShowAlice] = useState<boolean>(false);

    // Initial boot sequence effect
    useEffect(() => {
        addLog('Boot sequence started.', 'SYSTEM');
        const timer = setTimeout(() => {
            setShowBootScreen(false);
            addLog('System ready. Waiting for input.', 'SYSTEM');
        }, 2500); // Matches BootScreen animation
        return () => clearTimeout(timer);
    }, []);

    // Memoized derived state
    const selectedFile = useMemo(() => {
        return miniFiles.find(f => f.id === selectedFileId) || null;
    }, [miniFiles, selectedFileId]);

    const hasOutOfDateFiles = useMemo(() => {
        return miniFiles.some(f => f.dependencyStatus === DependencyStatus.OutOfDate);
    }, [miniFiles]);

    // Logging and Toast helpers
    const addLog = useCallback((message: string, source: LogEntry['source']) => {
        setLogs(prev => [...prev, { timestamp: new Date().toISOString(), source, message }]);
    }, []);

    const addToast = useCallback((message:string, type: 'success' | 'error' = 'success') => {
        const id = uuidv4();
        setToasts(prev => [...prev, { id, message, type }]);
        const timer = setTimeout(() => {
            setToasts(current => current.filter(t => t.id !== id));
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const updateMiniFiles = useCallback((filesToUpdate: MiniFile[]) => {
        setMiniFiles(prevFiles => {
            const newFileMap = new Map(prevFiles.map(f => [f.id, f]));
            filesToUpdate.forEach(f => newFileMap.set(f.id, f));

            return Array.from(newFileMap.values()).map(file => {
                const hasChangedDep = file.dependencies.some(depId => {
                    const originalDep = prevFiles.find(pf => pf.id === depId);
                    const newDep = newFileMap.get(depId);
                    return originalDep && newDep && originalDep.hash !== newDep.hash;
                });

                if (hasChangedDep) {
                    return { ...file, dependencyStatus: DependencyStatus.OutOfDate };
                }
                return file;
            });
        });
    }, []);

    // Core Handlers
    const handleProcessDocument = async (text: string) => {
        setIsLoading(true);
        setProjectSummary('');
        setMiniFiles([]);
        setSelectedFileId(null);
        addLog('Document processing started...', 'SYSTEM');
        addLog(`Input document size: ${text.length} characters.`, 'SYSTEM');
        masterDocument.resetSession();

        try {
            const result = await runGeminiAgent(text);
            addLog('Received response from Gemini.', 'GEMINI');

            const validatedFiles = result.miniFiles.map(file => {
                const validationErrors = validateMiniFile(file);
                return {
                  ...file,
                  validationErrors: validationErrors.length > 0 ? validationErrors : null,
                };
            });
            
            setProjectSummary(result.projectSummary);
            setMiniFiles(validatedFiles);
            addLog(`Generated ${result.miniFiles.length} mini-files.`, 'SYSTEM');
            addToast('Living Document generated successfully!');

            const fileChanges: FileChange[] = validatedFiles.map(f => ({
                path: f.id,
                type: 'create',
                content: f.content,
                size: f.content.length
            }));
            masterDocument.recordStep(
                'Generate Living Document',
                `Input document size: ${text.length}`,
                `Successfully generated ${result.miniFiles.length} mini-files.`,
                fileChanges
            );

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            addLog(`Error: ${errorMessage}`, 'SYSTEM');
            addToast(`Error: ${errorMessage}`, 'error');
            masterDocument.recordStep(
                'Generate Living Document',
                `Input document size: ${text.length}`,
                `Error: ${errorMessage}`,
                []
            );
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleMarkComplete = useCallback((fileId: string) => {
        const file = miniFiles.find(f => f.id === fileId);
        if (!file) return;

        const now = new Date().toISOString();
        
        const fileWithUpdates = { 
            ...file,
            status: Status.Complete, 
            provenance: { agent: 'human-user', completedAt: now },
            version: file.version + 1,
            hash: uuidv4().substring(0, 8),
        };
        
        const validationErrors = validateMiniFile(fileWithUpdates);
        
        if (validationErrors.length > 0) {
            addToast(`Validation failed: ${validationErrors.join(', ')}`, 'error');
            updateMiniFiles([{...file, validationErrors}]);
        } else {
            fileWithUpdates.validationErrors = null;
            updateMiniFiles([fileWithUpdates]);
            addLog(`File ${fileId} marked as complete.`, 'USER');
            addToast(`File ${fileId} marked as complete.`);

            const fileChange: FileChange = {
                path: fileId,
                type: 'modify',
                content: fileWithUpdates.content,
                size: fileWithUpdates.content.length,
            };
            masterDocument.recordStep(
                'Mark File Complete',
                `User marked file ${fileId} as complete.`,
                `File status set to "complete", version incremented to ${fileWithUpdates.version}.`,
                [fileChange]
            );
        }
    }, [miniFiles, updateMiniFiles, addLog, addToast]);

    const handleIntegrateJob = useCallback((job: Job) => {
        if (job.jobStatus !== 'completed' || !job.output) {
            addToast('Cannot integrate job: not completed or no output.', 'error');
            return;
        }

        const originalFile = miniFiles.find(f => f.id === job.miniFile.id);
        if(!originalFile) {
            addToast(`Original file with id ${job.miniFile.id} not found.`, 'error');
            return;
        }

        const now = new Date().toISOString();

        const updatedFile = {
            ...originalFile,
            version: originalFile.version + 1,
            hash: uuidv4().substring(0, 8),
            provenance: {
                agent: job.agentMetadata?.agentId || 'unknown-agent',
                model: job.agentMetadata?.model,
                completedAt: now
            },
            verificationTrail: [
                ...originalFile.verificationTrail,
                job.output.newVerificationStep || {
                    agent: job.agentMetadata?.agentId || 'unknown-agent',
                    timestamp: now,
                    status: 'pass',
                    notes: `Integrated from job ${job.jobId}.`,
                }
            ],
            content: job.output.updatedContent ?? originalFile.content
        };

        updateMiniFiles([updatedFile]);
        addLog(`Integrated job ${job.jobId} for file ${updatedFile.id}.`, 'AGENT');
        addToast(`Successfully integrated job for ${updatedFile.id}.`);
        
        const fileChange: FileChange = {
            path: updatedFile.id,
            type: 'modify',
            content: updatedFile.content,
            size: updatedFile.content.length,
        };
        masterDocument.recordStep(
            'Integrate Agent Job',
            `Integrating job ${job.jobId} for file ${updatedFile.id}`,
            `Content updated from agent, version incremented to ${updatedFile.version}.`,
            [fileChange]
        );
    }, [miniFiles, updateMiniFiles, addLog, addToast]);

    const handleReprocessOutOfDate = () => {
        addLog(`Reprocessing triggered for out-of-date files.`, 'USER');
        const filesToUpdate = miniFiles
            .filter(f => f.dependencyStatus === DependencyStatus.OutOfDate);
            
        if(filesToUpdate.length === 0) {
             addToast(`No out-of-date files to reprocess.`);
             return;
        }

        const updatedFiles = filesToUpdate.map(f => ({ ...f, dependencyStatus: DependencyStatus.UpToDate, status: Status.InProgress, provenance: null }));
        
        updateMiniFiles(updatedFiles);

        const fileChanges: FileChange[] = updatedFiles.map(f => ({
            path: f.id,
            type: 'modify',
            content: f.content,
            size: f.content.length,
        }));
        masterDocument.recordStep(
            'Reprocess Out-of-Date Files',
            `User triggered re-processing for ${filesToUpdate.length} files.`,
            `Reset status for out-of-date files. They are now "in_progress".`,
            fileChanges
        );

        addToast(`Reset status for ${filesToUpdate.length} out-of-date files.`);
    };

    // Render logic
    const renderContent = () => {
        if (!projectSummary) {
            return <IngestionView onProcess={handleProcessDocument} isLoading={isLoading} />;
        }
        return (
            <div className="flex h-screen overflow-hidden">
                <div className="w-1/2 overflow-y-auto">
                    <LivingDocumentView 
                        projectSummary={projectSummary}
                        miniFiles={miniFiles}
                        onSelectFile={setSelectedFileId}
                        selectedFileId={selectedFileId}
                        onReprocessOutOfDate={handleReprocessOutOfDate}
                        hasOutOfDateFiles={hasOutOfDateFiles}
                        addToast={addToast}
                    />
                </div>
                <div className="w-1/2 border-l border-slate-700 overflow-y-auto bg-black/20">
                    {selectedFile ? (
                        <MiniFileView 
                            file={selectedFile}
                            onMarkComplete={handleMarkComplete}
                            onIntegrateJob={handleIntegrateJob}
                        />
                    ) : (
                       <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col justify-center">
                            <div className="text-center text-slate-500 mb-8">
                                <FileTextIcon className="mx-auto w-12 h-12 text-slate-700 mb-4" />
                                <h3 className="text-lg font-medium text-slate-500" style={{fontFamily: 'var(--font-display)'}}>No File Selected</h3>
                                <p className="text-slate-600">Select a mini-file from the index to view its details.</p>
                            </div>
                            <PipelineDemo />
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="scanline-overlay">
            {showBootScreen && <BootScreen />}
            <div className={`transition-opacity duration-500 ${showBootScreen ? 'opacity-0' : 'opacity-100'}`}>
                {renderContent()}
            </div>
            <DebugTerminal logs={logs} addLog={addLog} onTriggerAlice={() => setShowAlice(true)} />
            <ToastContainer toasts={toasts} />
            {showAlice && <AliceWonderland onClose={() => setShowAlice(false)} />}
        </div>
    );
};

export default App;
