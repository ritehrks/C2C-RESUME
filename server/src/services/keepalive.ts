// Keepalive service for Render free tier
// Pings the server every 10 minutes to prevent it from sleeping

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export const startKeepAlive = (serverUrl: string) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('⏰ Keepalive disabled in development mode');
        return;
    }

    const pingServer = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/health`);
            if (response.ok) {
                console.log(`✅ Keepalive ping successful at ${new Date().toISOString()}`);
            } else {
                console.log(`⚠️ Keepalive ping returned status: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Keepalive ping failed:', error);
        }
    };

    // Initial ping after 1 minute
    setTimeout(() => {
        console.log('🔄 Starting keepalive service (pinging every 10 minutes)');
        pingServer();

        // Then ping every 10 minutes
        setInterval(pingServer, PING_INTERVAL);
    }, 60 * 1000);
};

export default startKeepAlive;
