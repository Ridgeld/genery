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
{/* <meta property="og:title" content="GENERY">
<meta property="og:description" content="Работа не волк, в лес не убежит.А развиваться надо!">
<meta property="og:image" content="https://raw.githubusercontent.com/Ridgeld/genery/main/public/cover_meta.png">
<meta property="og:url" content="https://ridgeld.github.io/genery/#/menu">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GENERY">

<!-- Additional Meta Tags for Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="GENERY">
<meta name="twitter:description" content="Работа не волк, в лес не убежит.А развиваться надо!">
<meta name="twitter:image" content="https://raw.githubusercontent.com/Ridgeld/genery/main/public/cover_meta.png"> */}

