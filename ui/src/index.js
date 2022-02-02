import './install-ses-lockdown.js';
import React from 'react';
import ReactDOM from 'react-dom';
import ApplicationContextProvider from './context/Application';
import App from './App.js';

ReactDOM.render(
  <ApplicationContextProvider>
    <App />
  </ApplicationContextProvider>,
  document.getElementById('root'),
);
