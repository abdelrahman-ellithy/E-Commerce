import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <App />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
