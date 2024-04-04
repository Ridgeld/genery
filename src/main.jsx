import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import Logo from './logo/Logo.jsx';
import './index.css';
import { createHashRouter, RouterProvider } from "react-router-dom";


const router = createHashRouter([
  {
    path: "/",
    element: <Logo/>,
  },
  {
    path: "/about-us",
    element: <App/>,
  },
]);

ReactDOM.createRoot(document.getElementById('main')).render(
  <React.StrictMode>
    <div className="wrapper">
      <div className="content">
      <RouterProvider router={router} />
      </div>
    </div>
  </React.StrictMode>,
)
