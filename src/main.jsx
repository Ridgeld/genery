import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Добавлены Routes и Route

// Определите маршруты внутри компонента App или внутри Routes
const routes = [
  {
    path: "",
    element: <div>Hello world!</div>,
  },
];

ReactDOM.createRoot(document.getElementById("main")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        <Route path="/app" element={<App />} /> {/* Пример маршрута для компонента App */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
