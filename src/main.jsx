import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { Routes, Route, Navigate } from "react-router-dom";

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

ReactDOM.render(
  <React.StrictMode>
    <Routes>
      <Route path='/' element={<App/>} />
      <Route path='/about' element={<h2>Привет!</h2>} />
  </Routes>
  </React.StrictMode>,
  document.getElementById('root')
);
