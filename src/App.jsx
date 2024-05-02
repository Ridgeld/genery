import React from "react";
import AppRouter from "./providers/AppRouter.jsx";
import { AuthProvider } from "./providers/Authprovired.jsx";

function App(){
  return (
    <>
      <AuthProvider>
        <AppRouter/>
      </AuthProvider>
    </>
  )
}
export default App