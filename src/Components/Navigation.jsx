import React, { useCallback, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Brand from '../Images/colLAB-logo.svg';

export default function Navigation() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(prev => !prev);
    const closeMenu = () => setIsOpen(false);

    const logout = useCallback(() => {
        localStorage.removeItem('userDetails');
        localStorage.clear();
        navigate('/');
    }, [navigate]);

    const navItems = [
        { to: '/', label: 'Home' },
        { to: '/profile', label: 'Chat Room' },
        { to: '/my-activity', label: 'My Activity' },
        { to: '/points-center', label: 'Points Center' },
        { to: '/contact-us', label: 'Contact Us' },
        { to: '/profile', label: 'Settings' }
    ];

    return (
        <>
            <header>
                <nav className="navbar navbar-expand-lg primary">
                    <div className="container-fluid">

                        {/* Brand */}
                        <NavLink className="nav-brand" to="/" onClick={closeMenu}>
                            <img
                                src={Brand}
                                alt="colLAB"
                                className="brand"
                                loading="lazy"
                            />
                        </NavLink>

                        {/* Mobile Toggle */}
                        <button
                            className="navbar-toggler"
                            type="button"
                            aria-label="Toggle navigation"
                            aria-expanded={isOpen}
                            onClick={toggleMenu}
                        >
                            <span className="navbar-toggler-icon" />
                        </button>

                        {/* Slide-out Nav */}
                        <div
                            className={[
                                'navbar-collapse',
                                'mobile-drawer',
                                isOpen ? 'is-open' : ''
                            ].join(' ')}
                        >
                            {/* Close button (X) */}
                            <button
                                type="button"
                                className="drawer-close"
                                aria-label="Close navigation"
                                onClick={closeMenu}
                            >
                                ×
                            </button>

                            <ul className="nav nav-pills ms-auto">
                                {navItems.map(({ to, label }) => (
                                    <li className="nav-item" key={to}>
                                        <NavLink
                                            to={to}
                                            end={to === '/'}
                                            onClick={closeMenu}
                                            className={({ isActive }) =>
                                                [
                                                    'nav-link',
                                                    isActive ? 'active active-header' : ''
                                                ].join(' ')
                                            }
                                        >
                                            {label}
                                        </NavLink>
                                    </li>
                                ))}

                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className="nav-link logout"
                                        onClick={logout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>

                    </div>
                </nav>
            </header>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="nav-overlay"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
