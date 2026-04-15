<<<<<<< HEAD

=======
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

<<<<<<< HEAD
// Suppress ResizeObserver loop error in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation();
    }
  });
}

// Debug: Log React mounting
console.log('index.js: Starting React app...');
console.log('Root element:', document.getElementById('root'));

=======
>>>>>>> b8fab12386a496c49ed776a5e9d9df6a7e6e7bf8
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
