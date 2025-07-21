

import { Status, SessionState } from '../types';

export interface AISessionStep {
  id: string;
  timestamp: Date;
  action: string;
  context: string;
  result: string;
  fileChanges: FileChange[];
  status: Status;
}

export interface FileChange {
  path: string;
  type: 'create' | 'modify' | 'delete';
  content?: string;
  diff?: string;
  size: number;
}

export interface MasterDocumentConfig {
  maxContextSize: number;
  autoSaveInterval: number;
  maxStepsBeforeCheckpoint: number;
  enableAutoRecovery: boolean;
}

/**
 * MasterDocument class - Core session management system
 * Inspired by Cursor's document tracking but adapted for AI session management
 */
export class MasterDocument {
  private sessionState: SessionState;
  private sessionSteps: AISessionStep[] = [];
  private config: MasterDocumentConfig;
  private storageKey = 'synapse-master-document';

  constructor(config: Partial<MasterDocumentConfig> = {}) {
    this.config = {
      maxContextSize: 8000, // tokens
      autoSaveInterval: 30000, // 30 seconds
      maxStepsBeforeCheckpoint: 10,
      enableAutoRecovery: true,
      ...config
    };

    this.sessionState = this.initializeSession();
    this.startAutoSave();
  }

  /**
   * Initialize a new session or recover existing one
   */
  private initializeSession(): SessionState {
    const existingSession = this.loadFromStorage();
    
    if (existingSession && this.config.enableAutoRecovery) {
      console.log('🔄 Recovering session:', existingSession.sessionId);
      return existingSession;
    }

    const newSession: SessionState = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      lastUpdate: new Date(),
      currentStep: 0,
      totalSteps: 0,
      documentVersion: '1.0.0',
      contextWindow: [],
      activeFiles: [],
      pendingTasks: [],
      completedTasks: []
    };

    console.log('🚀 Starting new session:', newSession.sessionId);
    return newSession;
  }

  /**
   * Record a new AI session step
   */
  public recordStep(action: string, context: string, result: string, fileChanges: FileChange[] = []): void {
    const step: AISessionStep = {
      id: this.generateStepId(),
      timestamp: new Date(),
      action,
      context,
      result,
      fileChanges,
      status: Status.Complete
    };

    this.sessionSteps.push(step);
    this.sessionState.currentStep++;
    this.sessionState.totalSteps++;
    this.sessionState.lastUpdate = new Date();

    // Update active files
    fileChanges.forEach(change => {
      if (change.type === 'create' || change.type === 'modify') {
        if (!this.sessionState.activeFiles.includes(change.path)) {
          this.sessionState.activeFiles.push(change.path);
        }
      } else if (change.type === 'delete') {
        this.sessionState.activeFiles = this.sessionState.activeFiles.filter(f => f !== change.path);
      }
    });

    // Manage context window size
    this.manageContextWindow(context, result);

    // Auto-checkpoint if needed
    if (this.sessionState.currentStep % this.config.maxStepsBeforeCheckpoint === 0) {
      this.createCheckpoint();
    }

    console.log(`📝 Step ${this.sessionState.currentStep}: ${action}`);
    this.saveToStorage(); // Save on every step for more robust recovery
  }

  /**
   * Manage context window to prevent overflows
   */
  private manageContextWindow(context: string, result: string): void {
    const newEntry = `${context} -> ${result}`;
    this.sessionState.contextWindow.push(newEntry);

    // Estimate token count (rough approximation)
    const totalTokens = this.sessionState.contextWindow.join(' ').length / 4;
    
    if (totalTokens > this.config.maxContextSize) {
      // Remove oldest entries to stay within limits
      const targetSize = Math.floor(this.config.maxContextSize * 0.8);
      while (this.sessionState.contextWindow.join(' ').length / 4 > targetSize) {
        this.sessionState.contextWindow.shift();
      }
      console.log('⚠️ Context window trimmed to prevent overflow');
    }
  }

  /**
   * Create a checkpoint for session recovery
   */
  public createCheckpoint(): void {
    const checkpoint = {
      sessionState: { ...this.sessionState },
      recentSteps: this.sessionSteps.slice(-5), // Last 5 steps
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`${this.storageKey}-checkpoint-${Date.now()}`, JSON.stringify(checkpoint));
    console.log('💾 Checkpoint created');
  }

  /**
   * Generate session context summary for AI
   */
  public getSessionContext(): string {
    const recentSteps = this.sessionSteps.slice(-3);
    const summary = [
      `Session: ${this.sessionState.sessionId}`,
      `Step: ${this.sessionState.currentStep}/${this.sessionState.totalSteps}`,
      `Active Files: ${this.sessionState.activeFiles.join(', ')}`,
      `Recent Actions:`,
      ...recentSteps.map(step => `- ${step.action}: ${step.result.substring(0, 100)}...`),
      `Pending Tasks: ${this.sessionState.pendingTasks.join(', ')}`,
      `Context Window: ${this.sessionState.contextWindow.slice(-2).join(' | ')}`
    ];

    return summary.join('\n');
  }

  /**
   * Update task status
   */
  public updateTask(task: string, completed: boolean): void {
    if (completed) {
      this.sessionState.pendingTasks = this.sessionState.pendingTasks.filter(t => t !== task);
      if (!this.sessionState.completedTasks.includes(task)) {
        this.sessionState.completedTasks.push(task);
      }
    } else {
      if (!this.sessionState.pendingTasks.includes(task)) {
        this.sessionState.pendingTasks.push(task);
      }
    }
    this.saveToStorage();
  }

  /**
   * Get recovery state for context restoration
   */
  public getRecoveryState(): { canRecover: boolean; lastKnownState?: SessionState; suggestions: string[] } {
    const suggestions = [
      'Review recent file changes',
      'Check pending tasks',
      'Verify completed actions',
      'Resume from last checkpoint'
    ];

    return {
      canRecover: this.sessionSteps.length > 0,
      lastKnownState: this.sessionState,
      suggestions
    };
  }

  /**
   * Auto-save functionality
   */
  private startAutoSave(): void {
    setInterval(() => {
      this.saveToStorage();
    }, this.config.autoSaveInterval);
  }

  /**
   * Save session to localStorage
   */
  private saveToStorage(): void {
    try {
        const data = {
          sessionState: this.sessionState,
          sessionSteps: this.sessionSteps,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch(e) {
        console.warn('Could not save session to storage. Might be full.', e);
    }
  }

  /**
   * Load session from localStorage
   */
  private loadFromStorage(): SessionState | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.sessionSteps = data.sessionSteps || [];
        return data.sessionState;
      }
    } catch (error) {
      console.warn('Failed to load session from storage:', error);
    }
    return null;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique step ID
   */
  private generateStepId(): string {
    return `step-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Export session data for backup/analysis
   */
  public exportSession(): string {
    return JSON.stringify({
      sessionState: this.sessionState,
      sessionSteps: this.sessionSteps,
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Clear current session and start fresh
   */
  public resetSession(): void {
    localStorage.removeItem(this.storageKey);
    this.sessionSteps = [];
    this.sessionState = this.initializeSession();
    this.saveToStorage();
    console.log('🔄 Session reset');
  }
}

// Singleton instance for global use
export const masterDocument = new MasterDocument();
