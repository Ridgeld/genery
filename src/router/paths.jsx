// router.js
import Logo from '../pages/logo/Logo.jsx';
import SignUp from '../components/auth/SignUp/SignUp.jsx';
import SignIn from '../components/auth/SignIn/SignIn.jsx';
import About from '../pages/about/About.jsx';
import Menu from '../pages/menu/Menu.jsx'
import Messenger from '../pages/messenger/Messenger.jsx';
import Timetable from '../pages/timetable/Timetable.jsx';
import ListMenu from '../pages/list-menu/ListMenu.jsx';
import PostContainer from '../pages/posts/PostContainer.jsx';
import Settings from '../pages/settings/Settings.jsx';
import CashBack from '../pages/cashback/CashBack.jsx';
import Shop from '../pages/shop/Shop.jsx';
import Casino from '../pages/casino/Casino.jsx';
import Updates from '../pages/updates/Updates.jsx';
import Downloads from '../pages/downloads/Downloads.jsx';
import Profile from '../pages/profile/Profile.jsx';
import GameMenu from '../pages/game-menu/GameMenu.jsx';
import Test from '../pages/testing/Test.jsx';
import Tapcoin from '../pages/tapcoin/Tapcoin.jsx';
import Rocket from '../pages/rocket/Rocket.jsx';

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
        exact: true,
        component: <Menu/>,
        auth: true,
    },
    {
        path: '/messenger',
        exact: true,
        component: <Messenger/>,
        auth: true,
    },
    {
        path: '/timetable',
        exact: true,
        component: <Timetable/>,
        auth: true,
    },
    {
        path: '/list-menu',
        exact: true,
        component: <ListMenu/>,
        auth: true,
    },
    {
        path:'/posts',
        exact: true,
        component: <PostContainer/>,
        auth: true,
    },
    {
        path:'/settings',
        exact: true,
        component: <Settings/>,
        auth: true,
    },
    {
        path:'/cashback',
        exact: true,
        component: <CashBack/>,
        auth: false,
    },
    {
        path:'/shop',
        exact: true,
        component: <Shop/>,
        auth: true,
    },
    {
        path:'/casino',
        exact: true,
        component: <Casino/>,
        auth: true,
    },
    {
        path:'/updates',
        exact: true,
        component: <Updates/>,
        auth: true,
    },
    {
        path:'/downloads',
        exact: true,
        component: <Downloads/>,
        auth: true,
    },
    {
        path:'/profile/:id?',
        exact: false,
        component: <Profile/>,
        auth: true,
    },
    {
        path:'/game-menu',
        exact: true,
        component: <GameMenu/>,
        auth: true,
    },
    {
        path:'/tapcoin',
        exact: true,
        component: <Tapcoin/>,
        auth: true,
    },
    {
        path:'/rocket',
        exact: true,
        component: <Rocket/>,
        auth: true,
    },
    {
        path:'/test',
        exact: true,
        component: <Test/>,
        auth: true,
    },
]