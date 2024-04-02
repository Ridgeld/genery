import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path:'/about-us',
    element: <h2>Привет</h2>
  }
])


ReactDOM.createRoot(document.getElementById('main')).render(
  <React.StrictMode>
    <div className="wrapper">
      <div className="content">
      <App/>
      <h2>6565</h2>
      </div>
    </div>
    {/* <App /> */}
  </React.StrictMode>,
)
