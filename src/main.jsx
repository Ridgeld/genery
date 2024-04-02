import React from 'react'
import ReactDOM from 'react-dom/client'
import { Logo } from './logo/Logo.jsx'
import { About } from './about/About.jsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Logo/>
  },
  {
    path:'/about-us',
    element: <About/>
  }
])


ReactDOM.createRoot(document.getElementById('main')).render(
  <React.StrictMode>
      {/* <RouterProvider router={router}/> */}
      <h2>6565</h2>
    {/* <App /> */}
  </React.StrictMode>,
)
