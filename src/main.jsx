import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import  App from './App.jsx'
import Layout from './components/layout/Layout.jsx';
// import AppRouter from './components/AppRouter.jsx';
import { ElementProvider } from './providers/ElementProvider.jsx';

ReactDOM.createRoot(document.getElementById('main')).render(
  <React.StrictMode>
    <ElementProvider>
      <Layout>
        <App/>
      </Layout>
    </ElementProvider>
  </React.StrictMode>
)


