(function () {
    // 1. Get configuration locally first
    const scriptTag = document.currentScript;
    const bizId = scriptTag.getAttribute('data-id');

    if (!bizId) {
        console.error('ContextBot: Missing data-id attribute.');
        return;
    }

    // Default Config
    let config = {
        primaryColor: scriptTag.getAttribute('data-color') || '#2563eb',
        autoOpenDelay: 0,
        agentName: 'Support',
        welcomeMessage: 'Hello! How can I help you today?'
    };

    const host = 'http://localhost:3000'; // Replace with production URL if needed

    // Initialize Widget
    async function init() {
        try {
            // Fetch remote config
            const res = await fetch(`${host}/api/widget/config/${bizId}`);
            if (res.ok) {
                const data = await res.json();
                config.primaryColor = data.widgetColor || config.primaryColor;
                config.autoOpenDelay = data.autoOpenDelay ?? 0;
                config.agentName = data.agentName || config.agentName;
                config.welcomeMessage = data.welcomeMessage || config.welcomeMessage;
            }
        } catch (e) {
            console.error('ContextBot: Failed to load config, using defaults.');
        }

        renderWidget();
    }

    function renderWidget() {
        // 2. Create Bubble
        const bubble = document.createElement('div');
        Object.assign(bubble.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: config.primaryColor,
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '999999',
            transition: 'transform 0.2s'
        });

        bubble.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
        document.body.appendChild(bubble);

        // 3. Create Iframe Container
        const iframeContainer = document.createElement('div');
        Object.assign(iframeContainer.style, {
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '380px',
            height: '600px',
            maxHeight: '80vh',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: '999999',
            display: 'flex',
            flexDirection: 'column',
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
            transformOrigin: 'bottom right'
        });

        const iframe = document.createElement('iframe');
        // Pass params to iframe
        const params = new URLSearchParams({
            bizId: bizId,
            color: config.primaryColor,
            agentName: config.agentName,
            welcome: config.welcomeMessage
        });

        iframe.src = `${host}/widget-chat.html?${params.toString()}`;
        Object.assign(iframe.style, {
            width: '100%',
            height: '100%',
            border: 'none'
        });

        iframeContainer.appendChild(iframe);
        document.body.appendChild(iframeContainer);

        // 4. Toggle Logic
        let isOpen = false;

        function toggleWidget(state) {
            isOpen = state !== undefined ? state : !isOpen;
            if (isOpen) {
                Object.assign(iframeContainer.style, {
                    opacity: '1',
                    transform: 'translateY(0) scale(1)',
                    pointerEvents: 'all'
                });
                bubble.style.transform = 'rotate(90deg)';
                localStorage.setItem('contextbot_has_opened_' + bizId, 'true');
            } else {
                Object.assign(iframeContainer.style, {
                    opacity: '0',
                    transform: 'translateY(20px) scale(0.95)',
                    pointerEvents: 'none'
                });
                bubble.style.transform = 'rotate(0deg)';
            }
        }

        bubble.addEventListener('click', () => toggleWidget());

        // 5. Auto-Open Logic
        // Check if user has seen widget before
        const STORAGE_KEY = 'contextbot_has_opened_' + bizId;
        const hasOpened = localStorage.getItem(STORAGE_KEY);

        if (!hasOpened && config.autoOpenDelay > 0) {
            setTimeout(() => {
                if (!isOpen) { // Only open if not already open
                    toggleWidget(true);
                }
            }, config.autoOpenDelay);
        }
    }

    init();

})();
