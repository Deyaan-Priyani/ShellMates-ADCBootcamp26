import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom";


const Navbar = () => {
    const user = useAuth().user;

    return (
        <nav className="navbar">
            {/*ShellMates logo. Returns user to home page on click.*/}
            <div className="navbar-logo">
                <Link to="/">ShellMates</Link>
            </div>

            {/*Navigation links*/}
            <ul className="navbar-links">
                <li>
                    <Link to="/">Landing</Link>
                </li>
                <li>
                    <Link to="/events">Events</Link>
                </li>
                <li>
                    <Link to="/profile">Profile</Link>
                </li>
                <li>
                    <Link to="/create">Create Event</Link>
                </li>
            </ul>

            {/*User Info. If user does not exist, shows link to login page.*/}
            <div className="navbar-user">
                {(user !== null) ? (
                    <>
                        <span className="user-name">{user.name}</span>
                        <span className="rank-badge">{user.rank}</span>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;