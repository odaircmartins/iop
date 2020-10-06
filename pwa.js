// CODELAB: Register service worker.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('iop-service-worker.js')
          .then((reg) => {
            console.log('Service worker registered.', reg);
          });
    });
  }