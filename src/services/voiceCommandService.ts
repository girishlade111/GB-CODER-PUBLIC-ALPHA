// Voice Command Service
export interface VoiceCommand {
  pattern: RegExp;
  action: (match: RegExpMatchArray) => Promise<void> | void;
  description: string;
  examples: string[];
}

export interface VoiceCommandStats {
  commandsExecuted: number;
  lastCommand: string | null;
  lastCommandTime: number | null;
}

class VoiceCommandService {
  private recognition: any = null;
  private isListening: boolean = false;
  private commands: VoiceCommand[] = [];
  private stats: VoiceCommandStats = {
    commandsExecuted: 0,
    lastCommand: null,
    lastCommandTime: null,
  };
  private onCommandExecuted?: (command: string) => void;

  constructor() {
    this.initializeRecognition();
    this.registerDefaultCommands();
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        this.processVoiceCommand(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  private registerDefaultCommands() {
    // Run code commands
    this.registerCommand({
      pattern: /run (the )?code|execute|preview|show (the )?result/i,
      action: () => this.triggerAction('run'),
      description: 'Run/execute the current code',
      examples: ['Run the code', 'Execute', 'Show preview'],
    });

    // Clear console
    this.registerCommand({
      pattern: /clear (the )?console|clear (the )?output|clear (the )?terminal/i,
      action: () => this.triggerAction('clear_console'),
      description: 'Clear the console output',
      examples: ['Clear console', 'Clear output', 'Clear terminal'],
    });

    // Format code
    this.registerCommand({
      pattern: /format (the )?code|beautify|prettify/i,
      action: () => this.triggerAction('format'),
      description: 'Format/beautify the code',
      examples: ['Format code', 'Beautify', 'Prettify'],
    });

    // Toggle theme
    this.registerCommand({
      pattern: /switch to (dark|light) (mode)?|toggle theme|change theme/i,
      action: (match) => this.triggerAction('toggle_theme', match[1]),
      description: 'Toggle dark/light theme',
      examples: ['Switch to dark mode', 'Toggle theme', 'Change to light mode'],
    });

    // Copy code
    this.registerCommand({
      pattern: /copy (the )?code|copy to clipboard/i,
      action: () => this.triggerAction('copy'),
      description: 'Copy code to clipboard',
      examples: ['Copy code', 'Copy to clipboard'],
    });

    // Download code
    this.registerCommand({
      pattern: /download|save (the )?project|export/i,
      action: () => this.triggerAction('download'),
      description: 'Download the project',
      examples: ['Download', 'Save project', 'Export'],
    });

    // Show help
    this.registerCommand({
      pattern: /help|what can (you|i) do|list commands|show commands/i,
      action: () => this.triggerAction('help'),
      description: 'Show available voice commands',
      examples: ['Help', 'What can you do', 'List commands'],
    });

    // Stop listening
    this.registerCommand({
      pattern: /stop listening|turn off voice|disable voice/i,
      action: () => this.stopListening(),
      description: 'Stop voice recognition',
      examples: ['Stop listening', 'Turn off voice', 'Disable voice'],
    });
  }

  public registerCommand(command: VoiceCommand) {
    this.commands.push(command);
  }

  public setCommandExecutedCallback(callback: (command: string) => void) {
    this.onCommandExecuted = callback;
  }

  public startListening(): boolean {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public toggleListening(): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening();
    }
  }

  public isListeningStatus(): boolean {
    return this.isListening;
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  private async processVoiceCommand(transcript: string) {
    console.log('Voice command received:', transcript);

    for (const command of this.commands) {
      const match = transcript.match(command.pattern);
      if (match) {
        await command.action(match);
        this.stats.commandsExecuted++;
        this.stats.lastCommand = transcript;
        this.stats.lastCommandTime = Date.now();
        
        if (this.onCommandExecuted) {
          this.onCommandExecuted(transcript);
        }
        return;
      }
    }

    console.log('No matching command found for:', transcript);
  }

  private triggerAction(action: string, param?: string) {
    // Dispatch custom event that can be listened to by components
    const event = new CustomEvent('voice-command', {
      detail: { action, param },
    });
    window.dispatchEvent(event);
  }

  public getCommands(): VoiceCommand[] {
    return this.commands;
  }

  public getStats(): VoiceCommandStats {
    return { ...this.stats };
  }

  public resetStats() {
    this.stats = {
      commandsExecuted: 0,
      lastCommand: null,
      lastCommandTime: null,
    };
  }
}

export const voiceCommandService = new VoiceCommandService();
