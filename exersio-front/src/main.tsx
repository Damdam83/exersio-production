import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/custom.css';
import { initializeApiInterceptors } from './services/apiInterceptor';

// Initialiser les intercepteurs API au démarrage
initializeApiInterceptors();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
