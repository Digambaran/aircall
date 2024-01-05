import 'styles/main.css';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
   <React.StrictMode>
      <App />
   </React.StrictMode>
);
