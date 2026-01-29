import React from 'react';
import SettingsLayout from './SettingsLayout';
import defaultAvatar from '../Images/user-icon-placeholder-1.png';

export default function SettingsProfile() {
    return (
        <SettingsLayout>
            <div className="settings-content">
                <div className="settings-info">
                    <h2>Profile Information</h2>
                    <p>
                        Update your profile information to help others recognize you and learn more
                        about your expertise.
                    </p>

                    <div className="settings-avatar">
                        <img src={defaultAvatar} alt="User avatar" loading="lazy" />
                        <button type="button" className="avatar-action" aria-label="Upload photo">
                            ⟳
                        </button>
                    </div>
                    <div className="settings-avatar-note">
                        Upload a square image for best results. Maximum size: 1MB
                    </div>
                </div>

                <form className="settings-form">
                    <div className="settings-grid">
                        <label>
                            First Name
                            <input type="text" placeholder="Marie" />
                        </label>
                        <label>
                            Last Name
                            <input type="text" placeholder="Claudette" />
                        </label>
                        <label>
                            Email
                            <input type="email" placeholder="marie@claudette.com" />
                        </label>
                        <label>
                            Job Title
                            <input type="text" placeholder="Researcher" />
                        </label>
                        <label className="settings-span">
                            Work Place
                            <input type="text" placeholder="Your workplace" />
                        </label>
                        <label className="settings-span">
                            Biography
                            <textarea placeholder="Tell us about yourself" />
                        </label>
                        <label>
                            Pronouns
                            <input type="text" placeholder="Your pronouns (e.g. she/her)" />
                        </label>
                        <label className="settings-toggle">
                            <input type="checkbox" />
                            <span>LGBTQIA Badge</span>
                        </label>
                    </div>

                    <button type="button" className="btn btn-primary settings-submit">
                        Update Profile
                    </button>
                </form>
            </div>
        </SettingsLayout>
    );
}
