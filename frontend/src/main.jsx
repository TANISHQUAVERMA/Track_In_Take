import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './components/context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(

  <BrowserRouter>
   <GoogleOAuthProvider clientId="24826653856-4gf5i8bvm25bhiqtf9qodv6fneu161gk.apps.googleusercontent.com">
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>


);
