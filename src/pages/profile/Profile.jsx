import { useAuth } from "../../providers/Authprovired.jsx";
import { useParams } from 'react-router-dom';

import AuthUserProfile from './AuthUserProfile.jsx';
import OtherUserProfile from './OtherUserProfile.jsx';

function Profile(){
    const { authUser } = useAuth();
    const { id } = useParams();

    if (!id || id === authUser._id) {
        return <AuthUserProfile id={authUser._id} />;
      } else {
        return <OtherUserProfile id={id} />;
      }
}
export default Profile