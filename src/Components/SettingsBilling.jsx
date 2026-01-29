import React from 'react';
import SettingsLayout from './SettingsLayout';

export default function SettingsBilling() {
    return (
        <SettingsLayout>
            <div className="settings-content">
                <div className="settings-info">
                    <h2>Billing</h2>
                    <p>Manage your billing information and payment preferences.</p>
                </div>

                <div className="billing-section">
                    <div className="billing-plans">
                        <div className="billing-card">
                            <div className="billing-title">FREE</div>
                            <div className="billing-price">
                                <span className="billing-amount">$0</span>
                                <span className="billing-duration">/ month</span>
                            </div>
                            <ul className="billing-list">
                                <li>Limited access to job postings</li>
                                <li>Limited access to mentorships</li>
                                <li>Limited collaboration and borrow requests</li>
                                <li>Points required to access platform features</li>
                            </ul>
                        </div>

                        <div className="billing-card billing-card--featured">
                            <div className="billing-badge">Most Popular</div>
                            <div className="billing-title">PREMIUM</div>
                            <div className="billing-price">
                                <span className="billing-amount">$7.99</span>
                                <span className="billing-duration">/ month</span>
                            </div>
                            <ul className="billing-list">
                                <li>Unlimited access to job postings</li>
                                <li>Unlimited access to mentorships</li>
                                <li>Unlimited collaboration and borrow requests</li>
                                <li>Unrestricted access to platform features</li>
                                <li>Earn double the participation points</li>
                                <li>Priority support</li>
                            </ul>
                        </div>
                    </div>

                    <div className="billing-actions">
                        <button type="button" className="btn btn-primary">
                            Upgrade
                        </button>
                        <button type="button" className="btn btn-dark">
                            Cancel Subscription
                        </button>
                    </div>

                    <form className="settings-form">
                        <label>
                            Cardholder Name
                            <input type="text" placeholder="Name on card" />
                        </label>
                        <label>
                            Card Number
                            <input type="text" placeholder="1234 5678 9012 3456" />
                        </label>
                        <div className="settings-grid">
                            <label>
                                Expiration Date
                                <input type="text" placeholder="MM/YY" />
                            </label>
                            <label>
                                CVC
                                <input type="text" placeholder="123" />
                            </label>
                        </div>
                        <button type="button" className="btn btn-primary settings-submit">
                            Save Billing
                        </button>
                    </form>
                </div>
            </div>
        </SettingsLayout>
    );
}
