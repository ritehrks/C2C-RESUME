'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered:', registration.scope);

                        // Check for updates every 30 minutes
                        setInterval(() => {
                            registration.update();
                        }, 30 * 60 * 1000);
                    })
                    .catch((error) => {
                        console.log('SW registration failed:', error);
                    });
            });

            // Listen for messages from the SW
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data?.type === 'SW_UPDATED') {
                    console.log('App updated to cache version:', event.data.version);
                }
            });
        }
    }, []);

    return null;
}
