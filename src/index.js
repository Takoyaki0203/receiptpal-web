// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

// Use only Cognito User Pool tokens in the client.
// This prevents Amplify from requesting guest Identity Pool creds
// during Google Hosted UI hydration (which causes the "Unauthenticated access..." error).
Amplify.configure({
  ...awsExports,
  federationTarget: 'COGNITO_USER_POOLS',
  aws_cognito_identity_pool_id: undefined, // ignore Identity Pool on the client
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
