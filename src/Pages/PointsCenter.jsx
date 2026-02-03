import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlay, faArrowRight, faMagnifyingGlass, faClock } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from 'react-loader-spinner';

import Navigation from '../Components/Navigation';
import SideNavigation from '../Components/Navigation/SideNavigation';
import defaultImage from '../Images/user-profile.svg';

export default function PointsCenter() {
    const Navigate = useNavigate(); // keep your original naming

    const userDetails = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userDetails'));
        } catch {
            return null;
        }
    }, []);

    
    const [ usersAccountDetails, setUsersAccountDetails ] = useState(null);
    const [ userPoints, setUserPoints ] = useState(0);
    const [ pointsToBuy, setPointsToBuy ] = useState(50);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState('');
    
    

    useEffect(() => {
        if (!userDetails?.token) {
            Navigate('/login');
            return;
        }

        let isMounted = true;

        const headers = {
            Authorization: `Bearer ${userDetails.token}`,
        };

        api.get(`/wp-json/wp/v2/users/${userDetails.id}`, { headers })
            .then((currentUserApi) => {
                if (!isMounted) return;

                const currentUser = currentUserApi?.data || null;
                setUsersAccountDetails(currentUser);

                const points = currentUser?.acf?.['user-points'] ?? 0;
                setUserPoints(points);
                localStorage.setItem('userPoints', JSON.stringify(points));
                setLoading(false);
            })
            .catch(() => {
                setError('Unable to load points at the moment.');
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [Navigate, userDetails?.id, userDetails?.token]);

    if (!localStorage.getItem('userDetails')) {
        window.location.replace('/');
        return null;
    }

    if (loading) {
        return (
            <TailSpin
                visible={true}
                height="80"
                width="80"
                color="#001923"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                wrapperClass="spinner"
            />
        );
    }

    return (
        <>
            <Navigation user={usersAccountDetails} />
            <main>
                <div className="page-body-container">
                    <div className="side-navigation-container" style={{ background: '#ffffff' }}>
                        <SideNavigation />
                    </div>

                    <div className="mt-4">
                        <div className="page-header">
                            <div>
                                <h1 className="mb-3">Points Center</h1>
                                <p>Learn how to earn points and start unlocking exclusive platform features</p>
                            </div>
                        </div>

                        <div className="user-details">
                            <div className="user-detail user user-detail-home">
                                <div className="user-info-image">
                                    {usersAccountDetails?.avatar_urls?.['48'] &&
                                    usersAccountDetails?.avatar_urls?.['48'] !== 'https://secure.gravatar.com/avatar/bda5ea71631e2cce73beb5e17644bd74?s=48&d=mm&r=g' ? (
                                        <img
                                            src={usersAccountDetails?.acf?.user_profile_picture || defaultImage}
                                            alt="User Avatar"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <img src={defaultImage} alt="Default User Avatar" loading="lazy" />
                                    )}
                                </div>

                                <div className="user-info-content">
                                <div>
                                    <p>Current Balance</p>
                                    <p className="user-greeting-name">
                                        <strong>{userPoints} pts</strong>
                                    </p>
                                </div>
                                </div>
                            </div>
                            </div>               

                        <div className="page-body-2 single-container">
                            <div className="posts">
                                <div className="create-posts" />
                                <div className="container-3 points-grid">
                                    {/* Participate */}
                                    <div className="points-box">
                                        <span className="points-tag">Participate</span>

                                        <div className="buy-points-card first-points-card">
                                            <label>
                                                Answer a question <span>→ 2 points</span>
                                            </label> 
                                        </div>

                                        <div className="buy-points-card">
                                            <label>
                                                Share a resource <span>→ 4 points</span>
                                            </label> 
                                        </div>

                                        <div className="buy-points-card">
                                            <label>
                                                Collaborate <span>→ 6 points</span>
                                            </label> 
                                        </div>

                                        <div className="buy-points-card">
                                            <label>
                                                Teach a skill <span>→ 6 points</span>
                                            </label> 
                                        </div>

                                    </div>

                                    {/* Buy Points */}
                                    <div className="points-box">
                                        <span className="points-tag">Buy Points</span>

                                        <p className="points-list">Buy points ($5 for 50 points)</p>

                                        <div className="buy-points-card">
                                            <label>
                                                How many points would you like to buy? (Minimum of 50)
                                            </label>
                                            <div className="buy-row">
                                                <input
                                                    className="points-input"
                                                    type="number"
                                                    min="50"
                                                    step="10"
                                                    value={pointsToBuy}
                                                    onChange={(e) => setPointsToBuy(Number(e.target.value) || 0)}
                                                />
                                                <strong style={{fontSize: "18px"}}>${Math.max(5, Math.round((pointsToBuy / 50) * 5))}</strong>
                                            </div>
                                        </div>

                                        <div className="stripe-card">
                                            <div className="stripe-card__header">
                                                Stripe Checkout
                                            </div>
                                            <div className="stripe-card__body">
                                                <div className="stripe-element-placeholder">
                                                    Card details (Stripe Elements will render here)
                                                </div>
                                                <button
                                                    className="btn btn-outline stripe-pay-btn"
                                                    type="button"
                                                    disabled
                                                >
                                                    Pay with Stripe (setup required)
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Watch Ad */}
                                    <div className="points-box">
                                        <span className="points-tag">Watch Ad</span>

                                        <p className="points-list">
                                            We encourage participation in order to gain points.
                                            However, below are alternative ways to score points:
                                        </p>

                                        <p><strong>Watch ad for 1 point.</strong></p>

                                        <button className="play-ad-btn" type="button">
                                            <FontAwesomeIcon icon={faPlay} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>
         
                </div>
            </main>
        </>
    );
}
