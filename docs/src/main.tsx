import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global tokens, themes and base styles (the package exposes these as styles.css).
import '../../src/styles/index.css';
import './docs.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
