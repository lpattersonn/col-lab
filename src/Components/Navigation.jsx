import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Brand from '../Images/colLAB-logo.svg';
import defaultImage from '../Images/user-profile.svg';

export default function Navigation({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);

    const logout = useCallback(() => {
        setShowMenu(false);
        localStorage.clear();
        navigate('/');
    }, [navigate]);

    /* -------------------------------
       CLOSE DROPDOWN LOGIC
    -------------------------------- */

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        }

        function handleScroll() {
            setShowMenu(false);
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setShowMenu(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setShowMenu(false);
    }, [location.pathname]);

    /* -------------------------------
       NAV ITEMS
    -------------------------------- */

    const navItems = [
        { to: '/dashboard', label: 'Home' },
        { to: '/chat-room', label: 'Chat Room' },
        { to: '/points-center', label: 'Points Center' },
        { to: '/settings/support', label: 'Contact Us' },
    ];

    const userName =
        user?.name ||
        user?.displayName ||
        user?.user_display_name ||
        user?.user_nicename ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
        'User';

    const userImage =
        user?.acf?.user_profile_picture ||
        user?.user_profile_picture ||
        user?.profile_picture ||
        user?.avatar_urls?.['48'] ||
        defaultImage;

    return (
        <header className="top-nav">
            {/* LEFT - Logo */}
            <div className="nav-logo">
                <NavLink to="/">
                    <img src={Brand} alt="colLAB" />
                </NavLink>
            </div>

            {/* CENTER - Links */}
            <div className="nav-links">
                {navItems.map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            isActive ? 'nav-link--active' : 'nav-link'
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </div>

            {/* RIGHT - Bell + User */}
            <div className="nav-right">
                <div className="nav-bell">
                    <FontAwesomeIcon icon={faBell} />
                    <span className="bell-dot" />
                </div>

                <div className="nav-user" ref={dropdownRef}>
                    <div
                        className="user-trigger"
                        onClick={() => setShowMenu(prev => !prev)}
                    >
                        <img
                            src={userImage}
                            alt={userName}
                            className="avatar"
                        />
                        <span className="user-name">{userName}</span>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>

                    {showMenu && (
                        <div className="user-dropdown">
                            <button
                                className="dropdown-item first-dropdown-item"
                                onClick={() => navigate('/settings/profile')}
                            >
                                <span>Profile / Settings</span>
                            </button>

                            <button
                                className="dropdown-item logout"
                                onClick={logout}
                            >
                                <span>Log out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
