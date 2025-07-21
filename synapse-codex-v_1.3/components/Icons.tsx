import React from 'react';

// --- NEW TERMINAL-FLAIR ICONS ---
// Redesigned with a more blocky, geometric, and "terminal" feel.
// Using a consistent stroke-width and sharp corners for a cohesive aesthetic.

/**
 * Icon for completed tasks/checkboxes.
 * Features a thick, blocky checkmark inside a square.
 */
export const CheckSquareIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h16v18H4z" />
    <path d="m9 12 3 3L22 7" />
  </svg>
);

/**
 * Icon for incomplete tasks/checkboxes. A simple, bold square.
 */
export const SquareIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h16v18H4z" />
  </svg>
);

/**
 * Icon for major warnings (e.g., out-of-date).
 * A classic warning triangle with a bold outline.
 */
export const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L1 21h22L12 2z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

/**
 * Icon for informational alerts (e.g., validation error).
 * A bold circle with a clear exclamation point.
 */
export const AlertCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 1 0-15 0z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

/**
 * Icon for downloading files, styled with a blocky arrow and base.
 */
export const DownloadIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" />
    <path d="m8 11 4 4 4-4" />
    <path d="M4 21h16" />
  </svg>
);

/**
 * A generic document icon with terminal flair, using sharp corners and straight lines.
 */
export const FileTextIcon: React.FC<{ className?: string, title?: string }> = ({ className = 'w-5 h-5', title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {title && <title>{title}</title>}
    <path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

/**
 * "AI magic" icon, styled as a techy data wave rather than sparkles.
 */
export const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 12 3-3 3 3 3-3 3 3 3-3 3 3" />
    <path d="M3 12v3l3 3 3-3 3 3 3-3 3 3v-3" />
  </svg>
);

/**
 * Loader with a blockier, terminal feel. A simple spinning arc.
 */
export const LoaderIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/**
 * History/log icon, represented as a stylized log file.
 */
export const HistoryIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
    <path d="M8 16h4" />
  </svg>
);

/**
 * Refresh/re-run icon with a clean, geometric design.
 */
export const RefreshCwIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v6h6" />
        <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
        <path d="M21 21v-6h-6" />
        <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </svg>
);

/**
 * Code modality icon, a stylized version of brackets and a slash.
 */
export const CodeIcon: React.FC<{ className?: string, title?: string }> = ({ className = 'w-5 h-5', title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {title && <title>{title}</title>}
        <path d="m8 18 6-12" />
        <path d="m10 8-4 4 4 4" />
        <path d="m14 16 4-4-4-4" />
    </svg>
);

/**
 * Image modality icon, a blocky representation of a landscape.
 */
export const ImageIcon: React.FC<{ className?: string, title?: string }> = ({ className = 'w-5 h-5', title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {title && <title>{title}</title>}
        <path d="M4 4h16v16H4z" />
        <path d="M8 12l4-4 8 8" />
        <path d="M4 16l4-4" />
        <circle cx="9" cy="9" r="1" />
    </svg>
);

/**
 * Table modality icon, represented as a simple, bold grid.
 */
export const TableIcon: React.FC<{ className?: string, title?: string }> = ({ className = 'w-5 h-5', title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {title && <title>{title}</title>}
        <path d="M4 4h16v16H4z" />
        <path d="M4 10h16" />
        <path d="M10 4v16" />
    </svg>
);

/**
 * Send/export job icon, a bold arrow indicating "outward" action.
 */
export const SendIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16" />
        <path d="m14 6 6 6-6 6" />
    </svg>
);

/**
 * Terminal icon for the debug console. A simple prompt in a box.
 */
export const TerminalIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z"/>
        <path d="m8 12 4 4 4-4"/>
    </svg>
);

// ALICE EASTER EGG
/**
 * A whimsical top hat icon for the Mad Hatter.
 */
export const TopHatIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H4v6h16v-6h-4V6a4 4 0 0 0-4-4Z" />
        <path d="M4 12h16v2H4z" />
    </svg>
);