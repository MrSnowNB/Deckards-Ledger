import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { TerminalIcon } from './Icons';

interface DebugTerminalProps {
    logs: LogEntry[];
    addLog: (message: string, source: LogEntry['source']) => void;
    // ALICE EASTER EGG: Add handler prop
    onTriggerAlice: () => void;
}

export const DebugTerminal: React.FC<DebugTerminalProps> = ({ logs, addLog, onTriggerAlice }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [command, setCommand] = useState('');
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLog(command, 'USER');

            // Synapse Codex rebrand: Update easter egg command and response
            if (command.toLowerCase() === '/synapse') {
                setTimeout(() => {
                    addLog("The future is already here – it's just not evenly distributed. ― William Gibson", 'SYSTEM');
                }, 300);
            } 
            // ALICE EASTER EGG: Handle the /alice command
            else if (command.toLowerCase() === '/alice') {
                onTriggerAlice();
            }
            
            setCommand('');
        }
    };

    if (!isOpen) {
        return (
            <div 
                className="fixed bottom-4 left-4 z-50 cursor-pointer p-2 flex items-center justify-center"
                onClick={() => setIsOpen(true)}
                // Synapse Codex rebrand: Update title
                title="Open SYNAPSE Console"
            >
                <div className="w-4 h-5 bg-[var(--color-accent-green)] blink-cursor" style={{boxShadow: 'var(--glow-green)'}}></div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-[95vw] max-w-lg h-80 lg:h-96 bg-black/80 backdrop-blur-md rounded-lg border border-[var(--color-accent-green)]/30 shadow-[var(--glow-green)] flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between p-2 border-b border-[var(--color-accent-green)]/20 bg-black/50">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-5 h-5 text-[var(--color-accent-green)]" />
                     {/* Synapse Codex rebrand: Update console title */}
                    <h3 className="font-bold text-sm text-[var(--color-accent-green)]" style={{fontFamily: 'var(--font-display)'}}>SYNAPSE CONSOLE</h3>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white text-xl leading-none"
                >
                    &times;
                </button>
            </div>
            <div ref={logContainerRef} className="flex-grow p-2 overflow-y-auto font-mono text-xs">
                {logs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                        <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-semibold ${
                            log.source === 'GEMINI' ? 'text-cyan-400' : 
                            log.source === 'USER' ? 'text-fuchsia-400' : 
                            log.source === 'AGENT' ? 'text-purple-400' : 
                            'text-slate-400'}`
                        }>{log.source}</span>
                        <p className="text-[var(--color-accent-green)]/90 whitespace-pre-wrap">{log.message}</p>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-[var(--color-accent-green)]/20 flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--color-accent-green)]">&gt;</span>
                <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleCommandKeyDown}
                    className="flex-grow bg-transparent text-[var(--color-accent-green)]/90 font-mono text-xs border-none focus:ring-0 p-0"
                     // ALICE EASTER EGG: The /alice command is now a deep easter egg with no hint.
                    placeholder='hint: try typing "/synapse"'
                    autoFocus
                />
                 <div className="terminal-input-cursor blink-cursor"></div>
            </div>
        </div>
    );
};