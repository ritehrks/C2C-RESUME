'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'c2c-install-dismissed';
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed recently
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
            const dismissDate = new Date(dismissedAt);
            const daysSince = (Date.now() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < DISMISS_DAYS) return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Small delay for page to load before showing banner
            setTimeout(() => {
                setShowBanner(true);
                setTimeout(() => setIsAnimating(true), 50);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowBanner(false);
            setDeferredPrompt(null);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    }, [deferredPrompt]);

    const handleDismiss = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => {
            setShowBanner(false);
            localStorage.setItem(DISMISS_KEY, new Date().toISOString());
        }, 300);
    }, []);

    if (isInstalled || !showBanner) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                padding: '12px 16px',
                transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    maxWidth: '480px',
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 -4px 30px rgba(0,0,0,0.3), 0 0 60px rgba(17,82,212,0.1)',
                    pointerEvents: 'auto',
                }}
            >
                {/* App Icon */}
                <div
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #1152d4, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 12px rgba(17,82,212,0.3)',
                    }}
                >
                    <span style={{ fontSize: '22px' }}>📄</span>
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#f1f5f9',
                            marginBottom: '2px',
                        }}
                    >
                        Install C2C Resume
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            lineHeight: 1.3,
                        }}
                    >
                        Add to home screen for quick access
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                        onClick={handleDismiss}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    >
                        Later
                    </button>
                    <button
                        onClick={handleInstall}
                        style={{
                            background: 'linear-gradient(135deg, #1152d4, #2563eb)',
                            border: 'none',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: 700,
                            padding: '8px 18px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 12px rgba(17,82,212,0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(17,82,212,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(17,82,212,0.4)';
                        }}
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
