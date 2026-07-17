import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '0.5rem',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.875rem',
        },
        success: { iconTheme: { primary: 'hsl(180, 66%, 49%)', secondary: 'white' } },
      }}
    />
  </React.StrictMode>
);