(() => {
  if (document.querySelector('link[data-arvi-web-chat-style]')) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/web-chat-v1.css';
  style.dataset.arviWebChatStyle = 'true';
  document.head.appendChild(style);

  if (!document.querySelector('script[data-arvi-web-chat-client]')) {
    const script = document.createElement('script');
    script.src = '/web-chat-v1.js';
    script.defer = true;
    script.dataset.arviWebChatClient = 'true';
    document.head.appendChild(script);
  }
})();
