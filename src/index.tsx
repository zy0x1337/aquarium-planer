import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker registrieren
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('App erfolgreich für Offline-Nutzung installiert');
  },
  onUpdate: () => {
    console.log('Neue Version verfügbar - Seite neu laden für Update');
    if (window.confirm('Neue Version verfügbar! Möchtest du die App aktualisieren?')) {
      window.location.reload();
    }
  }
});

reportWebVitals();
