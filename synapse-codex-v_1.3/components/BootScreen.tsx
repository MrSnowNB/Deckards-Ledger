import React from 'react';

export const BootScreen: React.FC = () => {
    return (
        <div 
            className="fixed inset-0 bg-black z-[200] flex items-center justify-center"
            style={{ animation: 'fade-in-out-boot 2.5s ease-in-out forwards' }}
        >
            <div className="text-center font-mono text-[var(--color-accent-green)]">
                <p 
                    className="text-lg sm:text-2xl" 
                    style={{ textShadow: 'var(--glow-green)' }}
                >
                    &gt; Booting Synapse Codex… system provenance online.
                    <span 
                        className="inline-block w-4 h-6 bg-[var(--color-accent-green)] ml-2 align-middle"
                        style={{ animation: 'blink-boot-cursor 1s step-end infinite' }}
                    ></span>
                </p>
            </div>
        </div>
    );
};
