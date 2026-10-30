import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global tokens, themes and base styles (the package exposes these as styles.css).
import '../../src/styles/index.css';
// SAP 72 font for the SAP themes (the package exposes it as sap-fonts.css).
import '../../src/themes/sap-fonts.css';
import './docs.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
