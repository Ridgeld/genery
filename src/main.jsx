import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="wrapper">
      <div className="content">
        <RouterProvider router={router}/>
        <h2>6565</h2>
      </div>
    </div>
  </React.StrictMode>,
)
