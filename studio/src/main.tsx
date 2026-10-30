import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/styles/index.css';
import '../../src/themes/sap-fonts.css';
import { Studio } from './Studio';

createRoot(document.getElementById('root')!).render(<StrictMode><Studio /></StrictMode>);
