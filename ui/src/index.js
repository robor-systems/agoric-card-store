import './install-ses-lockdown.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ApplicationContextProvider from './context/Application';
import App from './App.js';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path={'/:activeTab?'}>
        <ApplicationContextProvider>
          <App />
        </ApplicationContextProvider>
      </Route>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root'),
);
