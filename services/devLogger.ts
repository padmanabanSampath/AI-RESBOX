// A simple event-based logger for development visualization.

const emitter = new EventTarget();
const LOG_EVENT_NAME = 'dev-log';

export interface DevLog {
    timestamp: Date;
    attempt: number;
    success: boolean;
    data: string;
    error?: string;
}

/**
 * Dispatches a log event to be caught by the DevLogger component.
 * @param log The log object containing details of the generation attempt.
 */
export const logDev = (log: Omit<DevLog, 'timestamp'>) => {
    emitter.dispatchEvent(new CustomEvent(LOG_EVENT_NAME, {
        detail: { ...log, timestamp: new Date() }
    }));
};

export const devLogEmitter = emitter;
export const devLogEventName = LOG_EVENT_NAME;
