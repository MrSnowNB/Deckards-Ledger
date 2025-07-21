

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MiniFile, Status, DependencyStatus, Modality, ExportOptions, SessionState } from '../types';
import { 
    CheckSquareIcon, SquareIcon, FileTextIcon, SparklesIcon, AlertTriangleIcon, 
    RefreshCwIcon, CodeIcon, ImageIcon, TableIcon, AlertCircleIcon, DownloadIcon, HistoryIcon
} from './Icons';
import { createZip } from '../services/zipService';
import { masterDocument } from '../services/MasterDocument';

const ALL_MODALITIES: Modality[] = ['text', 'code', 'image', 'table'];

// --- Static Content for Satellite Docs ---
const PROJECT_CHARTER_CONTENT = `[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
---

# Project Charter

## Project Information
- **Project Name:** WorldTime Trivia - Local Multiplayer Game
- **Status:** In Development
- **Last Updated:** July 21, 2025
- **Session ID:** session-1753123812624-vo41yvwgs
- **Version:** 1.0.0

## Quick Links
- [Development Environment Setup](#)
- [Game Design Document](#)
- [Architecture Overview](#)
- [Testing Guidelines](#)
- [Deployment Instructions](#)

## MVP Checklist
- [ ] Core game engine implementation
- [ ] Player management system
- [ ] Question database and selection
- [ ] Time zone calculation system
- [ ] Scoring and feedback mechanisms
- [ ] Basic UI/UX implementation
- [ ] Multi-platform input handling
- [ ] Local storage and persistence
- [ ] Basic accessibility features
- [ ] Testing and validation

## Key Performance Indicators (KPIs)
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Core Features Complete | 100% | 15% | 🔴 |
| Test Coverage | 80% | 0% | 🔴 |
| Performance Score | 90+ | TBD | ⚪ |
| Accessibility Compliance | WCAG 2.1 AA | 0% | 🔴 |
| Code Quality Score | A | TBD | ⚪ |

## AI Development Best Practices
- 🤖 **Context Preservation:** Maintain session state and history
- 📋 **Incremental Development:** Build features step-by-step with validation
- 🔄 **Continuous Integration:** Test each component before proceeding
- 📚 **Documentation First:** Document before implementing
- 🎯 **User-Centric Design:** Focus on player experience and accessibility

---

# Team Agreements

## Code Standards
- **TypeScript First:** All new code must use TypeScript with strict mode
- **Component Structure:** Follow established React component patterns
- **File Organization:** Maintain clear separation between services, components, and utilities
- **Documentation:** Every function and component must have clear documentation

## Development Workflow
- **Version Control:** Use semantic versioning for all releases
- **Testing:** Implement tests before marking features as complete
- **Code Review:** All changes require validation before integration
- **Session Management:** Maintain detailed logs of all development activities

## Communication Protocols
- **Status Updates:** Regular checkpoint reviews in the Hiro Protocol
- **Issue Tracking:** Document all bugs and feature requests
- **Knowledge Sharing:** Update learning log with insights and discoveries
- **Progress Reporting:** Mark completed tasks as [x] in real-time

---
[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
Check this protocol on Hiro after finishing.`;

const LEARNING_LOG_CONTENT = `[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
---

# Learning Log

## Development Insights
- **Session Tracking Implementation:** Successfully integrated MasterDocument system for robust session management
- **Context Management:** Implemented intelligent context trimming to prevent overflows
- **Auto-Recovery:** Added localStorage persistence for session recovery
- **File Change Tracking:** Monitoring all modifications for better development flow

## Technical Discoveries
- Module resolution issues with relative paths in services directory
- Browser localStorage capabilities for session persistence
- TypeScript integration patterns for session management
- Component integration strategies for React applications

## Performance Notes
- Auto-save intervals set to 30 seconds for optimal performance
- Context window management prevents memory issues
- Efficient state tracking without performance degradation

---
[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
Check this protocol on Hiro after finishing.`;

const TROUBLESHOOTING_CONTENT = `[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
---

# Troubleshooting Guide

## Common Issues

### Module Resolution Errors
**Problem:** \`Failed to resolve module specifier "@/services/types"\`
**Solution:** 
- Check import paths use correct relative references (./,  ../, or /)
- Verify TypeScript path mapping in tsconfig.json
- Ensure target files exist in expected locations

### Session State Persistence
**Problem:** Session data not persisting between browser refreshes
**Solution:**
- Verify localStorage is enabled in browser
- Check for storage quota limits
- Validate JSON serialization/deserialization

### Component Integration Issues
**Problem:** Components not rendering or updating properly
**Solution:**
- Verify React hooks are used correctly
- Check for state mutation issues
- Ensure proper event handler binding

### Performance Degradation
**Problem:** Application becomes slow with extended use
**Solution:**
- Review context window management settings
- Check for memory leaks in session tracking
- Optimize auto-save frequency if needed

## Debug Commands
\`\`\`bash
# Clear session state
localStorage.removeItem('masterDocument')

# Check current session
console.log(JSON.parse(localStorage.getItem('masterDocument')))

# Force context trim
masterDoc.trimContext()

# Export session data
masterDoc.exportSession()
\`\`\`

## Emergency Recovery
1. **Session Corruption:** Clear localStorage and restart
2. **Context Overflow:** Manually trigger context trimming
3. **State Inconsistency:** Force checkpoint restoration
4. **Performance Issues:** Reduce auto-save frequency temporarily

---
[⬅️ Return to the Hiro Protocol](../000-hiro_protocol.md)
Check this protocol on Hiro after finishing.`;

const generateHiroProtocolContent = (miniFiles: MiniFile[], projectSummary: string, sessionState: SessionState | null) => {
    const checklistItems = miniFiles.map(file =>
        `- [${file.status === Status.Complete ? 'x' : ' '}] [${file.id}](docs/mini/${file.id}.md) - ${file.agentHint}`
    ).join('\n');

    const satelliteDocs = `## 📁 Satellite Documentation
- [PROJECT_CHARTER.md](docs/PROJECT_CHARTER.md) - Project definition and governance
- [LEARNING_LOG.md](docs/LEARNING_LOG.md) - Development insights and notes
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues and solutions`;

    return `
# 🎩 Hiro Protocol - Master Checklist
*Protocol Status: ACTIVE | Operator Access: AUTHORIZED | System Integrity: NOMINAL*

## 🚀 Current Operation Status
- **Session ID:** \`${sessionState?.sessionId || 'N/A'}\`
- **Active Files:** ${miniFiles.length} mini-files + satellite docs
- **Project Summary:** ${projectSummary || 'Project Summary not available.'}

---

## 📋 Master File Checklist
*Welcome, Operator. This is your cross-zone progress log—adapt, check off, and dive deep.*

${checklistItems}

---

${satelliteDocs}

---

## ⚠️ CRITICAL AGENT INSTRUCTIONS
**DO NOT OVERWRITE OR OMIT THIS FILE (000-hiro_protocol.md)**

This file serves as the master navigation hub for the entire project. When updating or regenerating files:
1. Always preserve this master checklist
2. Update checkboxes [x] to reflect completion status
3. Add new files to the appropriate phase section
4. Maintain all navigation links and file references
5. Keep the satellite documentation links intact

---
*End of Protocol - All systems operational. Proceed with confidence, Operator.*
    `.trim();
};


const DownloadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onDownload: (options: ExportOptions) => void;
}> = ({ isOpen, onClose, onDownload }) => {
    const [selectedModalities, setSelectedModalities] = useState<Modality[]>(ALL_MODALITIES);
    const [includeHeader, setIncludeHeader] = useState(true);

    if (!isOpen) return null;

    const handleModalityChange = (modality: Modality) => {
        setSelectedModalities(prev =>
            prev.includes(modality)
                ? prev.filter(m => m !== modality)
                : [...prev, modality]
        );
    };
    
    const handleDownloadClick = () => {
        if (selectedModalities.length === 0) {
            alert("Please select at least one modality to export.");
            return;
        }
        onDownload({ modalities: selectedModalities, includeHeader });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--color-bg-light)] rounded-lg shadow-xl w-full max-w-md border border-[var(--color-accent-magenta)]/50" style={{boxShadow: 'var(--glow-magenta)'}}>
                <div className="p-4 border-b border-[var(--color-accent-magenta)]/20 flex justify-between items-center animated-gradient animated-gradient-magenta">
                    <h2 className="text-lg font-bold text-black" style={{fontFamily: 'var(--font-display)'}}>Download Options</h2>
                     <button onClick={onClose} className="text-black/70 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Include by Modality</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ALL_MODALITIES.map(modality => (
                                <label key={modality} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={selectedModalities.includes(modality)}
                                        onChange={() => handleModalityChange(modality)}
                                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-[var(--color-accent-magenta)] focus:ring-[var(--color-accent-magenta)] focus:ring-offset-0"
                                    />
                                    <span className="text-sm capitalize text-slate-300">{modality}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">File Content</label>
                         <label htmlFor="include-header" className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-700/50">
                           <input
                                id="include-header"
                                type="checkbox"
                                checked={includeHeader}
                                onChange={(e) => setIncludeHeader(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-[var(--color-accent-magenta)] focus:ring-[var(--color-accent-magenta)] focus:ring-offset-0"
                            />
                            <span className="text-sm text-slate-300">Include YAML Header</span>
                        </label>
                    </div>
                </div>
                <div className="p-4 border-t border-[var(--color-accent-magenta)]/20 bg-black/30 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-transparent rounded-md hover:bg-slate-600">
                        Cancel
                    </button>
                    <button 
                        onClick={handleDownloadClick}
                        className="inline-flex items-center px-4 py-2 text-sm font-bold text-black bg-[var(--color-accent-magenta)] rounded-md hover:shadow-[var(--glow-magenta)] disabled:bg-slate-700 disabled:text-slate-400 transition-shadow animated-gradient animated-gradient-magenta"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2"/>
                        Download ZIP
                    </button>
                </div>
            </div>
        </div>
    );
};

const SessionStatus: React.FC = () => {
    const [session, setSession] = useState<SessionState | null>(null);

    useEffect(() => {
        const updateSession = () => {
            const recoveryState = masterDocument.getRecoveryState();
            setSession(recoveryState.lastKnownState ?? null);
        };
        updateSession();
        const intervalId = setInterval(updateSession, 5000); // Poll for updates
        return () => clearInterval(intervalId);
    }, []);

    if (!session) {
        return null;
    }

    return (
        <div className="bg-slate-900/70 rounded-lg shadow-lg border border-slate-800 p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                <HistoryIcon className="w-6 h-6 text-[var(--color-accent-blue)]" />
                Session State
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-400 font-mono">
                <div className="truncate"><span className="text-slate-500">ID:</span> <span className="text-[var(--color-accent-magenta)]" title={session.sessionId}>{session.sessionId}</span></div>
                <div><span className="text-slate-500">Version:</span> {session.documentVersion}</div>
                <div><span className="text-slate-500">Steps:</span> {session.currentStep}</div>
                <div><span className="text-slate-500">Last Update:</span> {new Date(session.lastUpdate).toLocaleTimeString()}</div>
                <div className="col-span-1 md:col-span-2"><span className="text-slate-500">Active Files:</span> {session.activeFiles.length}</div>
            </div>
        </div>
    );
};

interface LivingDocumentViewProps {
  projectSummary: string;
  miniFiles: MiniFile[];
  onSelectFile: (fileId: string) => void;
  selectedFileId: string | null;
  onReprocessOutOfDate: () => void;
  hasOutOfDateFiles: boolean;
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const ModalityIcon: React.FC<{ modality: Modality, className?: string, title?: string }> = ({ modality, className, title }) => {
    switch (modality) {
        case 'code': return <CodeIcon className={className} title={title || 'Code'} />;
        case 'image': return <ImageIcon className={className} title={title || 'Image'} />;
        case 'table': return <TableIcon className={className} title={title || 'Table'} />;
        case 'text':
        default:
            return <FileTextIcon className={className} title={title || 'Text'} />;
    }
};

const MODALITY_FILTERS: Modality[] = ['text', 'code', 'image', 'table'];

export const LivingDocumentView: React.FC<LivingDocumentViewProps> = ({
  projectSummary,
  miniFiles,
  onSelectFile,
  selectedFileId,
  onReprocessOutOfDate,
  hasOutOfDateFiles,
  addToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<Modality | 'all'>('all');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [pulsingRows, setPulsingRows] = useState<{ [id: string]: string }>({});
  const prevFilesRef = useRef<MiniFile[] | undefined>(undefined);

  useEffect(() => {
    if (prevFilesRef.current) {
        const newPulses: { [id: string]: string } = {};
        miniFiles.forEach(file => {
            const prevFile = prevFilesRef.current!.find(pf => pf.id === file.id);
            if (prevFile) {
                if (prevFile.status !== file.status && file.status === Status.Complete) {
                    newPulses[file.id] = 'animate-pulse-green';
                } else if (prevFile.dependencyStatus !== file.dependencyStatus && file.dependencyStatus === DependencyStatus.OutOfDate) {
                    newPulses[file.id] = 'animate-pulse-amber';
                }
            }
        });

        if (Object.keys(newPulses).length > 0) {
            setPulsingRows(newPulses);
            // The animation duration is 1.5s. We clear it after that.
            const timer = setTimeout(() => setPulsingRows({}), 1500);
            return () => clearTimeout(timer);
        }
    }
    prevFilesRef.current = miniFiles;
  }, [miniFiles]);

  const filteredFiles = useMemo(() => {
    if (activeFilter === 'all') {
      return miniFiles;
    }
    return miniFiles.filter(file => file.modalities.includes(activeFilter));
  }, [miniFiles, activeFilter]);

  const getRowClass = (file: MiniFile) => {
    const animationClass = pulsingRows[file.id] || '';
    if (selectedFileId === file.id) return `bg-purple-600/30 shadow-[inset_0_0_10px_rgba(162,89,250,0.6)] border-y-[var(--color-accent-purple)]/70 ${animationClass}`;
    if (file.validationErrors) return `bg-red-900/40 hover:bg-red-900/60 hover:border-y-red-500/50 ${animationClass}`;
    if (file.dependencyStatus === DependencyStatus.OutOfDate) return `bg-amber-900/40 hover:bg-amber-900/60 hover:border-y-amber-500/50 ${animationClass}`;
    return `hover:bg-slate-800/50 border-y-transparent hover:border-y-[var(--color-accent-purple)]/50 ${animationClass}`;
  };

   const handleDownload = async (options: ExportOptions) => {
    try {
        const sessionState = masterDocument.getRecoveryState().lastKnownState;
        const hiroProtocolContent = generateHiroProtocolContent(miniFiles, projectSummary, sessionState);

        const additionalFiles = [
            { path: '000-hiro_protocol.md', content: hiroProtocolContent },
            { path: 'docs/PROJECT_CHARTER.md', content: PROJECT_CHARTER_CONTENT },
            { path: 'docs/LEARNING_LOG.md', content: LEARNING_LOG_CONTENT },
            { path: 'docs/TROUBLESHOOTING.md', content: TROUBLESHOOTING_CONTENT },
        ];

        const blob = await createZip(miniFiles, options, additionalFiles);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'synapse-codex-export.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        masterDocument.recordStep(
            'Export Project',
            `User downloaded project with options: ${JSON.stringify(options)}`,
            'Successfully created and downloaded ZIP archive.',
            [] // No file changes for a download
        );
        addToast('ZIP archive created successfully!');
        setIsDownloadModalOpen(false);
    } catch (error) {
        console.error("Failed to create ZIP:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        masterDocument.recordStep(
            'Export Project',
            `User initiated download with options: ${JSON.stringify(options)}`,
            `Failed to create ZIP archive: ${errorMessage}`,
            []
        );
        addToast('Failed to create ZIP archive.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
      />
      <SessionStatus />
      <div className="bg-slate-900/70 rounded-lg shadow-lg border border-[var(--color-accent-blue)]/20 p-6 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-3 responsive-header" style={{fontFamily: 'var(--font-display)'}}>
          <SparklesIcon className="w-6 h-6 text-[var(--color-accent-blue)]"/>
          Project Summary
        </h2>
        <p className="mt-4 text-slate-400 whitespace-pre-wrap">{projectSummary}</p>
      </div>

      <div className="bg-slate-900/70 rounded-lg shadow-lg border border-slate-800 overflow-hidden">
        <div className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-3 responsive-header" style={{fontFamily: 'var(--font-display)'}}>
                    <FileTextIcon className="w-6 h-6 text-[var(--color-accent-blue)]"/>
                    Mini-File Index
                </h2>
                <p className="text-slate-500 mt-1">Index of all generated mini-files. Click a file to view its content.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                  {hasOutOfDateFiles && (
                     <button
                        onClick={onReprocessOutOfDate}
                        className="inline-flex items-center px-4 py-2 border border-[var(--color-accent-green)] text-sm font-bold rounded-md text-[var(--color-accent-green)] bg-transparent hover:bg-[var(--color-accent-green)] hover:text-black hover:shadow-[var(--glow-green)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-green)] transition-all"
                    >
                        <RefreshCwIcon className="w-5 h-5 mr-2" />
                        Re-process
                    </button>
                  )}
                  {miniFiles.length > 0 && (
                     <button
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-[var(--color-accent-blue)] text-sm font-medium rounded-md shadow-sm text-[var(--color-accent-blue)] bg-transparent hover:bg-[var(--color-accent-blue)] hover:text-black hover:shadow-[var(--glow-blue)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-blue)] transition-all"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Download All
                    </button>
                  )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-400">Filter by modality:</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${activeFilter === 'all' ? 'bg-[var(--color-accent-blue)] text-black font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                        All
                    </button>
                    {MODALITY_FILTERS.map(modality => (
                        <button
                            key={modality}
                            onClick={() => setActiveFilter(modality)}
                            title={`Filter by ${modality}`}
                            className={`p-2 rounded-full transition-colors ${activeFilter === modality ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                            <ModalityIcon modality={modality} className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-black/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-accent-purple)]/80 uppercase tracking-wider w-12">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-accent-purple)]/80 uppercase tracking-wider">File ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-accent-purple)]/80 uppercase tracking-wider">Agent Hint</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-accent-purple)]/80 uppercase tracking-wider w-32">Modalities</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-accent-purple)]/80 uppercase tracking-wider w-24">Tokens</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[var(--color-accent-purple)]/80 uppercase tracking-wider w-20">Deps</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[var(--color-accent-purple)]/80 uppercase tracking-wider w-20">Valid</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-slate-800">
              {filteredFiles.map((file) => (
                <tr 
                  key={file.id} 
                  onClick={() => onSelectFile(file.id)}
                  className={`cursor-pointer transition-all duration-200 border-y ${getRowClass(file)}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {file.status === Status.Complete ? (
                      <CheckSquareIcon className="w-5 h-5 text-[var(--color-accent-green)]" />
                    ) : (
                      <SquareIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-accent-blue)] font-mono">{file.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 truncate max-w-xs">{file.agentHint}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-x-2">
                        {file.modalities.map(m => <ModalityIcon key={m} modality={m} className="w-5 h-5 text-slate-500" />)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{file.tokens}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {file.dependencyStatus === DependencyStatus.OutOfDate && (
                      <div title="Dependencies are out of date">
                        <AlertTriangleIcon className="w-5 h-5 text-amber-400 mx-auto" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {file.validationErrors && (
                      <div className="group relative flex justify-center">
                        <AlertCircleIcon className="w-5 h-5 text-red-400 mx-auto" />
                        <div className="absolute bottom-full mb-2 w-max max-w-xs bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-red-500/50">
                           {file.validationErrors.join(', ')}
                           <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
