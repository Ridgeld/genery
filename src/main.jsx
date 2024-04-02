import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const routes = [
  {
    path: '/',
    element: <h2>Привет!</h2>
  },
  {
    path:'/about-us',
    element: <h3>О нас</h3>
  }
];

const router = createBrowserRouter({ routes });

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
