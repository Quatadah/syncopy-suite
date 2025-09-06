import React from 'react';
import { createRoot } from 'react-dom/client';
import ExtensionPopup from './components/ExtensionPopup';

// Initialize the popup
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<ExtensionPopup />);

