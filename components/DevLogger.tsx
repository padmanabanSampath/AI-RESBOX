import React, { useState, useEffect, useRef } from 'react';
import { devLogEmitter, devLogEventName, DevLog } from '../services/devLogger';

const DevLogger: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<DevLog[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleLog = (event: Event) => {
            const customEvent = event as CustomEvent<DevLog>;
            setLogs(prevLogs => [customEvent.detail, ...prevLogs]);
        };

        devLogEmitter.addEventListener(devLogEventName, handleLog);

        return () => {
            devLogEmitter.removeEventListener(devLogEventName, handleLog);
        };
    }, []);

    useEffect(() => {
        // Scroll to top when new log arrives
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
        }
    }, [logs]);

    const toggleOpen = () => setIsOpen(!isOpen);
    const clearLogs = () => setLogs([]);

    const panelAnimation = isOpen ? 'translate-y-0' : 'translate-y-full';

    return (
        <>
            <button
                onClick={toggleOpen}
                className="fixed bottom-4 right-4 z-[60] bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-110"
                aria-label="Toggle Developer Log"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
            </button>
            <div className={`fixed bottom-0 left-0 right-0 h-1/3 bg-gray-900/90 backdrop-blur-sm border-t-2 border-indigo-500 z-50 p-4 text-white text-sm font-mono overflow-hidden flex flex-col transition-transform duration-300 ease-in-out ${panelAnimation}`}>
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="text-lg font-bold">Puzzle Generation Log</h3>
                    <button onClick={clearLogs} className="px-3 py-1 bg-red-600 rounded hover:bg-red-700">Clear</button>
                </div>
                <div ref={logContainerRef} className="flex-grow overflow-y-auto bg-black/50 p-2 rounded">
                    {logs.length === 0 ? (
                        <p className="text-gray-500">Waiting for puzzle generation attempts...</p>
                    ) : (
                        logs.map((log, index) => {
                            let formattedData = log.data;
                            if (!log.error) {
                                try {
                                    // Make sure data is a non-empty string before parsing
                                    if(log.data && typeof log.data === 'string') {
                                        formattedData = JSON.stringify(JSON.parse(log.data), null, 2);
                                    }
                                } catch (e) { /* ignore, just use raw string */ }
                            }
                            return (
                                <div key={index} className={`p-2 border-l-4 ${log.success ? 'border-green-500' : 'border-red-500'} mb-2 animate-pop-in`} style={{animationDuration: '0.2s'}}>
                                    <p>
                                        <span className="font-bold">{log.timestamp.toLocaleTimeString()}</span> -
                                        <span className={`font-bold mx-2 ${log.success ? 'text-green-400' : 'text-red-400'}`}>
                                            Attempt #{log.attempt} - {log.success ? 'VALID' : 'INVALID'}
                                        </span>
                                    </p>
                                    <pre className="whitespace-pre-wrap bg-gray-800 p-2 rounded mt-1 text-xs">{log.error ? log.error : formattedData}</pre>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default DevLogger;
