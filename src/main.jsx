import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { createHashRouter, RouterProvider } from "react-router-dom";


const router = createHashRouter([
  {
    path: "/",
    element: <h2>Привет!</h2>,
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
      <h2>6565</h2>
      </div>
    </div>
    {/* <App /> */}
  </React.StrictMode>,
)
