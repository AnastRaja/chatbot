(function () {
    // 1. Get configuration from script tag
    const scriptTag = document.currentScript;
    const bizId = scriptTag.getAttribute('data-id');
    const primaryColor = scriptTag.getAttribute('data-color') || '#2563eb';

    if (!bizId) {
        console.error('ContextBot: Missing data-id attribute.');
        return;
    }

    // 2. Create Bubble
    const bubble = document.createElement('div');
    Object.assign(bubble.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        backgroundColor: primaryColor,
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999999',
        transition: 'transform 0.2s'
    });

    // Icon
    bubble.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;

    document.body.appendChild(bubble);

    // 3. Create Iframe Container
    const iframeContainer = document.createElement('div');
    Object.assign(iframeContainer.style, {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        zIndex: '999999',
        display: 'none',
        flexDirection: 'column'
    });

    // Use absolute URL for production; assuming localhost:3000 for this exercise
    // In a real deployment, this would be the actual domain
    const host = 'http://localhost:3000';
    const iframe = document.createElement('iframe');
    iframe.src = `${host}/widget-chat.html?bizId=${bizId}&color=${encodeURIComponent(primaryColor)}`;
    Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        border: 'none'
    });

    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer);

    // 4. Toggle Logic
    let isOpen = false;
    bubble.addEventListener('click', () => {
        isOpen = !isOpen;
        iframeContainer.style.display = isOpen ? 'flex' : 'none';
        bubble.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
    });

})();
