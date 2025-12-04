import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

// Get the root element
const container = document.getElementById('root');

// Create the root
const root = createRoot(container);

// Render the app
root.render(<App />);