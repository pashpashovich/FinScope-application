import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

const routing = (
  <Router>
    <App />
  </Router>
);

ReactDOM.render(routing, document.getElementById('root'));