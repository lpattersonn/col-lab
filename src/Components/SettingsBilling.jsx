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
                                <span className="billing-duration">/ month (plus applicable taxes)</span>
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

                    <div className="plan-card">
                        <div className="plan-card-header">
                            <h3>Plan</h3>
                            <div className="plan-card-actions">
                                <button type="button" className="btn btn-outline">Cancel plan</button>
                            </div>
                        </div>
                        <div className="plan-card-body">
                            <div className="plan-title">
                                <h4>Free Plan</h4>
                            </div>
                            <div className="plan-info">
                                <div className="plan-info-item">
                                    <div className="plan-info-icon">📅</div>
                                    <div>
                                        <p className="plan-info-label">Renews on</p>
                                        <p className="plan-info-value">February 10, 2026</p>
                                    </div>
                                </div>
                                <div className="plan-info-item">
                                    <div className="plan-info-icon">💲</div>
                                    <div>
                                        <p className="plan-info-label">Price after renewal</p>
                                        <p className="plan-info-value">$7.99 CAD/month</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="billing-method">
                        <h3 className="billing-method-title">Payment method for your team</h3>
                        <div className="billing-method-card">
                            <div className="billing-method-header">
                                <div className="billing-method-logo">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                                        alt="Mastercard"
                                    />
                                </div>
                                <div className="billing-method-details">
                                    <h4>Mastercard •••• 1852</h4>
                                    <p>Expires August 2027</p>
                                </div>
                            </div>
                            <button type="button" className="btn btn-outline billing-manage-btn">
                                Manage
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
