type LogContext = Record<string, unknown>;

export class Logger {
  private readonly component: string;

  constructor(component = 'app') {
    this.component = component;
  }

  info(message: string, context?: LogContext): void {
    console.log(JSON.stringify({ level: 'info', component: this.component, message, ...context }));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(JSON.stringify({ level: 'warn', component: this.component, message, ...context }));
  }

  error(message: string, context?: LogContext): void {
    console.error(JSON.stringify({ level: 'error', component: this.component, message, ...context }));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify({ level: 'debug', component: this.component, message, ...context }));
    }
  }
}
