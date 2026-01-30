import React from 'react';
import SettingsLayout from './SettingsLayout';

export default function SettingsPassword() {
    return (
        <SettingsLayout>
            <div className="settings-content">
                <div className="settings-info">
                    <h2>Password</h2>
                    <p>Update your password to keep your account secure.</p>
                </div>
                <form className="settings-form">
                    <label>
                        Current Password
                        <input type="password" />
                    </label>
                    <label>
                        New Password
                        <input type="password" />
                    </label>
                    <label>
                        Confirm New Password
                        <input type="password" />
                    </label>
                    <button type="button" className="btn btn-dark">
                        Update Password
                    </button>
                </form>
            </div>
        </SettingsLayout>
    );
}
