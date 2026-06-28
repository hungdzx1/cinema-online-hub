import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppProviders from './providers/AppProviders';
import App from './App.jsx';
import './styles/index.css';   // hoặc './index.css' tùy bạn để CSS ở đâu

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);