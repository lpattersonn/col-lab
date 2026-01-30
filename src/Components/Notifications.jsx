import React, { useMemo } from 'react';
import Navigation from './Navigation';
import SideNavigation from './Navigation/SideNavigation';
import defaultAvatar from '../Images/user-icon-placeholder-1.png';

const mockNotifications = [
    {
        id: 1,
        name: 'Ilaria Epifano',
        message: 'commented on your collaboration request.',
        time: 'Just now',
    },
    {
        id: 2,
        name: 'Clive Jabangwe',
        message: 'sent you a mentorship request update.',
        time: '12 min ago',
    },
    {
        id: 3,
        name: 'Marie Claudette',
        message: 'accepted your resource sharing invite.',
        time: '1 hour ago',
    },
    {
        id: 4,
        name: 'Jordan Lee',
        message: 'liked your learning center post.',
        time: 'Yesterday',
    },
];

export default function Notifications() {
    const userDetails = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userDetails'));
        } catch {
            return null;
        }
    }, []);

    if (!localStorage.getItem('userDetails')) {
        window.location.replace('/');
        return null;
    }

    return (
        <>
            <Navigation user={userDetails} />
            <main>
                <div className="page-body-container">
                    <div className="side-navigation-container" style={{ background: '#ffffff' }}>
                        <SideNavigation />
                    </div>

                    <div className="mt-4 notifications-page">
                        <div className="page-header">
                            <div>
                                <h1 className="mb-0">Notifications</h1>
                            </div>
                        </div>

                        <div className="notifications-card">
                            <div className="notifications-header">
                                <h2>Recent</h2>
                                <button type="button" className="btn btn-outline">
                                    Mark all as read
                                </button>
                            </div>

                            <div className="notifications-list">
                                {mockNotifications.map((item) => (
                                    <div key={item.id} className="notification-item">
                                        <img
                                            src={defaultAvatar}
                                            alt="User avatar"
                                            className="notification-avatar"
                                            loading="lazy"
                                        />
                                        <div className="notification-body">
                                            <p className="notification-text">
                                                <strong>{item.name}</strong> {item.message}
                                            </p>
                                            <span className="notification-time">{item.time}</span>
                                        </div>
                                        <span className="notification-dot" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
