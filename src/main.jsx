import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { HashRouter, createBrowserRouter } from 'react-router-dom'


const router = createBrowserRouter([
  {
    path: "/",
    element: <h2>Привет!</h2>
  },
  {
    path:'/about-us',
    element: <h2>О нас</h2>
  }
])


ReactDOM.createRoot(document.getElementById('main')).render(
  <React.StrictMode>
    <div className="wrapper">
      <div className="content">
      <HashRouter router={router}/>
      <h2>6565</h2>
      </div>
    </div>
    {/* <App /> */}
  </React.StrictMode>,
)
