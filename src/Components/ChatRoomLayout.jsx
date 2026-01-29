import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import SideNavigation from './Navigation/SideNavigation';
import defaultAvatar from '../Images/user-icon-placeholder-1.png';
import SendIcon from '../Images/send_icon.svg';

export default function ChatRoomLayout({
    title,
    subtitle,
    showChat = true,
    enableDrawer = false,
    drawerConfig = {},
}) {
    const userDetails = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userDetails'));
        } catch {
            return null;
        }
    }, []);
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const {
        buttonLabel = 'Request Collaboration',
        headerTitle = 'Collaboration Request',
        pointsLabel = '*5 points required',
        fields = [],
    } = drawerConfig;

    const isActivePath = (prefixes) =>
        prefixes.some((prefix) => location.pathname.startsWith(prefix));

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

                    <div className="mt-4 chat-room">
                        <div className="page-header">
                            <div>
                                <h1 className="mb-3">{title}</h1>
                                {subtitle ? <p>{subtitle}</p> : null}
                            </div>
                            {enableDrawer ? (
                                <div className="col-12 text-end mt-4">
                                    <button
                                        className="btn btn-header"
                                        type="button"
                                        onClick={() => setIsDrawerOpen(true)}
                                    >
                                        {buttonLabel}
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="chat-room-tabs">
                            <NavLink
                                to="/chat-room"
                                className={
                                    isActivePath(['/chat-room']) &&
                                    !isActivePath([
                                        '/chat-room/collaborations',
                                        '/chat-room/mentorships',
                                        '/chat-room/share-resources',
                                        '/chat-room/learning-center',
                                    ])
                                        ? 'chat-room-tab chat-room-tab--primary active'
                                        : 'chat-room-tab chat-room-tab--primary'
                                }
                            >
                                Pick a Room
                            </NavLink>
                            <NavLink
                                to="/chat-room/collaborations"
                                className={
                                    isActivePath(['/chat-room/collaborations'])
                                        ? 'chat-room-tab active'
                                        : 'chat-room-tab'
                                }
                            >
                                Collaborations
                            </NavLink>
                            <NavLink
                                to="/chat-room/mentorships"
                                className={
                                    isActivePath(['/chat-room/mentorships'])
                                        ? 'chat-room-tab active'
                                        : 'chat-room-tab'
                                }
                            >
                                Mentorships
                            </NavLink>
                            <NavLink
                                to="/chat-room/share-resources"
                                className={
                                    isActivePath(['/chat-room/share-resources'])
                                        ? 'chat-room-tab active'
                                        : 'chat-room-tab'
                                }
                            >
                                Share resources
                            </NavLink>
                            <NavLink
                                to="/chat-room/learning-center"
                                className={
                                    isActivePath(['/chat-room/learning-center'])
                                        ? 'chat-room-tab active'
                                        : 'chat-room-tab'
                                }
                            >
                                Learning center
                            </NavLink>
                        </div>

                        {showChat ? (
                        <div className="chat-room-card">
                            <div className="chat-room-grid">
                                <aside className="chat-room-sidebar">
                                    <div className="chat-room-sidebar-header">
                                        <h2>Conversations</h2>
                                        <button
                                            type="button"
                                            className="chat-room-new"
                                            aria-label="Start a new conversation"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="chat-room-list">
                                        <div className="chat-room-item active">
                                            <img
                                                src={defaultAvatar}
                                                alt="Conversation avatar"
                                                className="chat-room-avatar"
                                                loading="lazy"
                                            />
                                            <div className="chat-room-meta">
                                                <div className="chat-room-name">Clive Jabangwe</div>
                                                <div className="chat-room-time">Just now</div>
                                            </div>
                                            <div className="chat-room-actions" aria-hidden="true">
                                                <span className="chat-room-trash">...</span>
                                            </div>
                                        </div>
                                        <div className="chat-room-item">
                                            <img
                                                src={defaultAvatar}
                                                alt="Conversation avatar"
                                                className="chat-room-avatar"
                                                loading="lazy"
                                            />
                                            <div className="chat-room-meta">
                                                <div className="chat-room-name">Ilaria Epifano</div>
                                                <div className="chat-room-time">6 days ago</div>
                                            </div>
                                            <div className="chat-room-actions" aria-hidden="true">
                                                <span className="chat-room-trash">...</span>
                                            </div>
                                        </div>
                                    </div>
                                </aside>

                                <section className="chat-room-thread">
                                    <div className="chat-room-thread-header">
                                        <div className="thread-user">
                                            <img
                                                src={defaultAvatar}
                                                alt="Conversation avatar"
                                                className="thread-avatar"
                                                loading="lazy"
                                            />
                                            <div className="thread-name">Clive Jabangwe</div>
                                        </div>
                                    </div>

                                    <div className="chat-room-thread-body">
                                        <div className="thread-empty">
                                            No messages yet. Start the conversation!
                                        </div>
                                    </div>

                                    <div className="chat-room-thread-composer">
                                        <input
                                            type="text"
                                            className="thread-input"
                                            placeholder="Type a message..."
                                            aria-label="Type a message"
                                        />
                                        <button type="button" className="thread-send" aria-label="Send message">
                                            <img src={SendIcon} alt="" className="thread-send-icon" />
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                        ) : null}

                        {enableDrawer ? (
                            <>
                                <div
                                    className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
                                    onClick={() => setIsDrawerOpen(false)}
                                />

                                <aside className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
                                    <div className="drawer-header">
                                        <button
                                            className="back-btn"
                                            type="button"
                                            onClick={() => setIsDrawerOpen(false)}
                                        >
                                            ← Back
                                        </button>

                                        <span className="points-badge">{pointsLabel}</span>
                                    </div>

                                    <h1>{headerTitle}</h1>
                                    <div className="drawer-divider" />
                                    <form className="drawer-form">
                                        {(fields || []).map((field, index) => {
                                            const key = `${field.name || 'field'}-${index}`;
                                            if (field.type === 'textarea') {
                                                return (
                                                    <label key={key} className={index === 0 ? 'first-label' : ''}>
                                                        {field.label}
                                                        <textarea
                                                            placeholder={field.placeholder}
                                                        />
                                                    </label>
                                                );
                                            }
                                            if (field.type === 'select') {
                                                return (
                                                    <label key={key} className={index === 0 ? 'first-label' : ''}>
                                                        {field.label}
                                                        <select>
                                                            {(field.options || []).map((option) => (
                                                                <option key={option}>{option}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                );
                                            }
                                            return (
                                                <label key={key} className={index === 0 ? 'first-label' : ''}>
                                                    {field.label}
                                                    <input
                                                        type={field.type || 'text'}
                                                        maxLength={field.maxLength}
                                                        placeholder={field.placeholder}
                                                    />
                                                </label>
                                            );
                                        })}

                                        <div className="drawer-actions">
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => setIsDrawerOpen(false)}
                                            >
                                                Cancel
                                            </button>

                                            <button type="submit" className="btn btn-dark">
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                </aside>
                            </>
                        ) : null}
                    </div>
                </div>
            </main>
        </>
    );
}
