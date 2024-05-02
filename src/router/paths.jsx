// router.js
import Logo from '../pages/logo/Logo.jsx';
import SignUp from '../components/auth/SignUp/SignUp.jsx';
import SignIn from '../components/auth/SignIn/SignIn.jsx';
import About from '../pages/about/About.jsx';
import Menu from '../pages/menu/Menu.jsx'

export const routes = [
    {
        path: '/',
        exact: true,
        component: <Logo/>,
        auth: false,
    },
    {
        path: '/sign-up',
        exact: false,
        component: <SignUp/>,
        auth: false,
    },
    {
        path: '/sign-in',
        exact: false,
        component: <SignIn/>,
        auth: true,
    },
    {
        path: '/about',
        exact: false,
        component: <About/>,
        auth: false,
    },
    {
        path: '/menu',
        exact: false,
        component: <Menu/>,
        auth: true,
    }
]