import { useContext } from "react"
import { AuthContext } from './Authprovired.jsx'

export const useAuth = () => {
    const value = useContext(AuthContext);
    return value
}