import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faCreditCard, faLifeRing } from '@fortawesome/free-solid-svg-icons';
import Navigation from './Navigation';
import SideNavigation from './Navigation/SideNavigation';

export default function SettingsLayout({ children }) {
    const [ usersAccountDetails, setUsersAccountDetails ] = useState(null);
    const userDetails = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userDetails'));
        } catch {
            return null;
        }
    }, []);
    const location = useLocation();

    const isActivePath = (prefixes) =>
        prefixes.some((prefix) => location.pathname.startsWith(prefix));

    if (!localStorage.getItem('userDetails')) {
        window.location.replace('/login');
        return null;
    }

    return (
        <>
            <Navigation user={usersAccountDetails} />
            <main>
                <div className="page-body-container">
                    <div className="side-navigation-container" style={{ background: '#ffffff' }}>
                        <SideNavigation />
                    </div>

                    <div className="mt-4 settings-page">
                        <div className="page-header">
                            <div>
                                <h1 className="mb-0">Settings</h1>
                            </div>
                        </div>

                        <div className="settings-tabs">
                            <NavLink
                                to="/settings/profile"
                                className={
                                    location.pathname === '/settings/profile'
                                        ? 'settings-tab active'
                                        : 'settings-tab'
                                }
                            >
                                <span className="settings-tab-icon">
                                    <FontAwesomeIcon icon={faUser} />
                                </span>
                                Profile
                            </NavLink>
                            <NavLink
                                to="/settings/password"
                                className={
                                    isActivePath(['/settings/password'])
                                        ? 'settings-tab active'
                                        : 'settings-tab'
                                }
                            >
                                <span className="settings-tab-icon">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                Password
                            </NavLink>
                            <NavLink
                                to="/settings/billing"
                                className={
                                    isActivePath(['/settings/billing'])
                                        ? 'settings-tab active'
                                        : 'settings-tab'
                                }
                            >
                                <span className="settings-tab-icon">
                                    <FontAwesomeIcon icon={faCreditCard} />
                                </span>
                                Billing
                            </NavLink>
                            <NavLink
                                to="/settings/support"
                                className={
                                    isActivePath(['/settings/support'])
                                        ? 'settings-tab active'
                                        : 'settings-tab'
                                }
                            >
                                <span className="settings-tab-icon">
                                    <FontAwesomeIcon icon={faLifeRing} />
                                </span>
                                Support
                            </NavLink>
                        </div>

                        <div className="settings-card">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
