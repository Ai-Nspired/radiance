import './index.css'; // <--- THIS LINE IS CRUCIAL
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ... rest of the file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
