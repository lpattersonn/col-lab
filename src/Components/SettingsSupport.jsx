import React from 'react';
import SettingsLayout from './SettingsLayout';

export default function SettingsSupport() {
    return (
        <SettingsLayout>
            <div className="settings-content">
                <div className="settings-info">
                    <h2>Support</h2>
                    <p>Let us know how we can help. We will get back to you shortly.</p>
                </div>
                <form className="settings-form">
                    <label>
                        Reason
                        <select>
                            <option value="">Select a reason</option>
                            <option>General Inquiry</option>
                            <option>Technical Support</option>
                            <option>Collaboration</option>
                            <option>Feedback</option>
                            <option>Other</option>
                        </select>
                    </label>
                    <label>
                        Subject
                        <input type="text" placeholder="How can we help?" />
                    </label>
                    <label>
                        Message
                        <textarea placeholder="Describe the issue or request" />
                    </label>
                    <button type="button" className="btn btn-primary settings-submit">
                        Send Message
                    </button>
                </form>
            </div>
        </SettingsLayout>
    );
}
