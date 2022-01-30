import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { login, logout } from "../../store/userSlice";

function Header() {
    const { loggedIn } = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()
    return (
        <div className="header">
            {loggedIn ? <button onClick={() => dispatch(logout())}>Logout</button> : <button onClick={() => dispatch(login())}>Login</button>}
        </div>
    );
}

export default Header;