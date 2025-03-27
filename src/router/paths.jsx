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
import Quiz from '../pages/quiz/Quiz.jsx';
import Search from '../pages/search/Search.jsx';
import Group from '../pages/group/Group.jsx';
import GroupList from '../pages/group-list/GroupList.jsx';
import CreateGroup from '../pages/create-group/CreateGroup.jsx';
import Matrix from '../pages/matrix/Matrix.jsx';
import { auth } from '../../firebase.js';
import FlippyBird from '../pages/flippyBird/FlippyBird.jsx';
import Rating from '../pages/rating/Rating.jsx';
import Subscribers from '../pages/subscribers/Subscribers.jsx';
import GuessLine from '../pages/guess-line/GuessLine.jsx';
import PostPage from '../pages/posts/PostPage.jsx';
import Banner from '../pages/banner/Banner.jsx';
import DownloadBanner from '../components/banners/DownloadBanner/DownloadBanner.jsx';
import ResetPassword from '../components/auth/ResetPassword/ResetPassword.jsx';
import NewPassword from '../components/auth/NewPassword/NewPassword.jsx';
import ResetPasswordAuthUser from '../components/auth/ResetPasswordAuthUser/ResetPasswordAuthUser.jsx';

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
        path: '/resetpassword',
        exact: true,
        component: <ResetPassword/>,
        banner: true,
        auth: false
    },
    {
        path: '/authresetpassword',
        exact: true,
        component: <ResetPasswordAuthUser/>,
        banner: true,
        auth: true
    },
    {
        path: '/setnewpassword/*',
        exact: false,
        component: <NewPassword/>,
        banner: true,
        auth: false
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
        path: '/timetable/:id?',
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
        path:'/post/:id?',
        exact: true,
        component: <PostPage/>,
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
        path:'/download/:id?',
        exact: false,
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
        path:'/quiz/:mode?',
        exact: false,
        component: <Quiz/>,
        auth: true,
    },
    {
        path:'/search',
        exact: true,
        component: <Search/>,
        auth: true,
    },
    {
        path:'/test',
        exact: true,
        component: <Test/>,
        auth: true,
    },
    {
        path:'/group/:id?',
        exact: false,
        component: <Group/>,
        auth: true,
    },
    {
        path:'/subscribers/:id?',
        exact: false,
        component: <Subscribers/>,
        auth: true,
    },
    {
        path:'/group-list',
        exact: false,
        component: <GroupList/>,
        auth: true,
    },
    {
        path:'/create-group',
        exact: false,
        component: <CreateGroup/>,
        auth: true,
    },
    {
        path: '/matrix',
        exact: true,
        component: <Matrix/>,
        auth: false
    },
    {
        path: '/flippybird',
        exact: true,
        component: <FlippyBird/>,
        auth: false
    },
    {
        path: '/rating',
        exact: true,
        component: <Rating/>,
        auth: false
    },
    {
        path: '/guessline',
        exact: true,
        component: <GuessLine/>,
        auth: false
    },
    {
        path: '/banner',
        exact: true,
        component: <Banner/>,
        banner: true,
        auth: false
    },
]