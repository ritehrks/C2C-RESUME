'use client';

import { useState, useEffect } from 'react';

export default function UpdateNotification() {
    const [showUpdate, setShowUpdate] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        // Listen for new service worker waiting
        const handleControllerChange = () => {
            // New SW has taken over, reload
            window.location.reload();
        };

        // Check for waiting SW on load
        navigator.serviceWorker.ready.then((registration) => {
            // If there's already a waiting worker
            if (registration.waiting) {
                setShowUpdate(true);
                setTimeout(() => setIsVisible(true), 50);
                return;
            }

            // Listen for new workers
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        setShowUpdate(true);
                        setTimeout(() => setIsVisible(true), 50);
                    }
                });
            });
        });

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        };
    }, []);

    const handleRefresh = () => {
        navigator.serviceWorker.ready.then((registration) => {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => setShowUpdate(false), 300);
    };

    if (!showUpdate) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '16px',
                left: '50%',
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '-120%'})`,
                zIndex: 10000,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(34,197,94,0.08)',
                    whiteSpace: 'nowrap',
                }}
            >
                {/* Pulse dot */}
                <div style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            background: '#22c55e',
                            animation: 'updatePulse 2s ease-in-out infinite',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            inset: '-4px',
                            borderRadius: '50%',
                            background: 'rgba(34, 197, 94, 0.3)',
                            animation: 'updatePulse 2s ease-in-out infinite',
                        }}
                    />
                </div>

                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                    New version available
                </span>

                <button
                    onClick={handleRefresh}
                    style={{
                        background: '#22c55e',
                        border: 'none',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '6px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#16a34a')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#22c55e')}
                >
                    Refresh
                </button>

                <button
                    onClick={handleDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        lineHeight: 1,
                    }}
                >
                    ×
                </button>
            </div>

            <style>{`
                @keyframes updatePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.3); }
                }
            `}</style>
        </div>
    );
}
