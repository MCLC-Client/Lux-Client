import React from 'react';

export default function WindowControls({ isMaximized = false, className = '' }) {
    if (!window.electronAPI) {
        return null;
    }

    return (
        <div className={`flex gap-1 no-drag ${className}`.trim()}>
            <button onClick={() => window.electronAPI.minimize()} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-accent-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <button onClick={() => window.electronAPI.maximize()} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-accent-foreground transition-colors">
                {isMaximized ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3.75v4.5m0 0H4.5m4.5 0L3.75 3.75M9 20.25v-4.5m0 0H4.5m4.5 0L3.75 20.25M15 3.75v4.5m0 0h4.5m-4.5 0l5.25-5.25M15 20.25v-4.5m0 0h4.5m-4.5 0l5.25 5.25" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                )}
            </button>
            <button onClick={() => window.electronAPI.close()} className="p-1.5 hover:bg-red-500 rounded text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}
