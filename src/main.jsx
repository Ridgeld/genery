import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const routes = [
  {
    path: '/',
    element: <App/>
  },
  {
    path:'/about-us',
    element: <h3>О нас</h3>
  }
];

const router = createBrowserRouter({ routes });

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
  document.getElementById('root')
);
