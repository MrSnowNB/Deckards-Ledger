export enum Status {
  InProgress = 'in_progress',
  Complete = 'complete',
}

export enum DependencyStatus {
  UpToDate = 'up_to_date',
  OutOfDate = 'out_of_date',
}

export type Modality = 'text' | 'code' | 'image' | 'table';

export interface VerificationStep {
    agent: string;
    timestamp: string;
    status: 'pass' | 'fail' | 'pending';
    notes?: string;
}

export interface Provenance {
    agent: string; // e.g., 'human-user', 'code-generator-v2'
    model?: string; // e.g., 'gemini-2.5-flash'
    completedAt: string;
}

export interface MiniFile {
  id: string;
  parentId: string;
  hash: string;
  version: number;
  created: string;
  tokens: number;
  status: Status;
  agentHint: string;
  dependencies: string[];
  content: string;
  modalities: Modality[];
  dependencyStatus: DependencyStatus;
  provenance: Provenance | null;
  verificationTrail: VerificationStep[];
  validationErrors: string[] | null;
}

// This represents the initial structure from Gemini
export type InitialMiniFile = Pick<MiniFile, 'id' | 'agentHint' | 'tokens' | 'content' | 'modalities'>

// This is the shape of the JSON object we expect from the Gemini API
export interface GeminiApiResponse {
  projectSummary: string;
  miniFiles: InitialMiniFile[];
}

// This is the shape of the data after our service has processed it
export interface ProcessDocumentResponse {
    projectSummary: string;
    miniFiles: MiniFile[];
}

// --- Agent Job Export/Import Schema ---

export type ProcessingTask = 'rewrite_section' | 'add_code_example' | 'verify_content' | 'summarize_chunk';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface JobOutput {
    updatedContent?: string;
    newVerificationStep?: VerificationStep;
    // can be extended with other outputs, e.g., generated images, etc.
}

export interface Job {
    jobId: string;
    task: ProcessingTask;
    jobStatus: JobStatus;
    miniFile: MiniFile; // The full state of the mini-file at time of export
    output: JobOutput | null;
    error: string | null;
    // Metadata about the agent that should/did process this
    agentMetadata?: {
        agentId: string;
        model?: string;
    };
}

// --- Toast Notifications & Export ---

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error';
}

export interface ExportOptions {
    modalities: Modality[];
    includeHeader: boolean;
}

// --- Synapse Console ---
// Synapse Codex rebrand: update comment
// Log entry for the Synapse Console
export interface LogEntry {
    timestamp: string;
    source: 'SYSTEM' | 'GEMINI' | 'AGENT' | 'USER';
    message: string;
}

// --- ALICE EASTER EGG ---
export interface AliceChatMessage {
    id: string;
    sender: 'user' | 'mad-hatter';
    text: string;
}

// --- Master Document & Session ---
export interface SessionState {
  sessionId: string;
  startTime: Date;
  lastUpdate: Date;
  currentStep: number;
  totalSteps: number;
  documentVersion: string;
  contextWindow: string[];
  activeFiles: string[];
  pendingTasks: string[];
  completedTasks: string[];
}
