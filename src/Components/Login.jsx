import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../Images/colLAB-logo.svg';

export default function Login() {
    const navigate = useNavigate();

    // Login state
    const [userDetails, setUserDetails] = useState('');
    const [serverMessage, setServerMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // User input
    const [userLogin, setUserLogin] = useState({
        user: '',
        pass: ''
    });

    const [apiSettings, setApiSettings] = useState({
        user: '',
        pass: ''
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setUserLogin(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (isSubmitting) return;

        setServerMessage('');
        localStorage.removeItem('registrationMessage');
        setIsSubmitting(true);
        setApiSettings({ ...userLogin });
    }

    // Login request
    useEffect(() => {
        if (!apiSettings.user || !apiSettings.pass) {
            setIsSubmitting(false);
            return;
        }

        const newFormData = new FormData();
        newFormData.append('username', apiSettings.user);
        newFormData.append('password', apiSettings.pass);

        const url = `${process.env.REACT_APP_API_URL}/wp-json/jwt-auth/v1/token`;

        axios
            .post(url, newFormData)
            .then(response => {
                if (response?.data?.data) {
                    localStorage.setItem(
                        'userDetails',
                        JSON.stringify(response.data.data)
                    );
                    setUserDetails(response.data.data);
                } else {
                    setServerMessage('Invalid login response.');
                }
            })
            .catch(err => {
                setServerMessage(
                    err?.response?.data?.message || 'Login failed.'
                );
                console.error(err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }, [apiSettings]);

    // Redirect after login
    useEffect(() => {
        if (userDetails && userDetails.length > 0) {
            navigate('/dashboard', { replace: true });
        }
    }, [userDetails, navigate]);

    function userServerMessage() {
        if (!serverMessage) return null;

        return (
            <div className="row mb-4">
                <div className="col">
                    <div className="alert alert-danger" role="alert">
                        <p>{serverMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    function userServerRegisterMessage() {
        const msg = localStorage.getItem('registrationMessage');
        if (!msg) return null;

        return (
            <div className="row">
                <div className="col">
                    <div className="alert alert-success" role="alert">
                        <p>{msg}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (localStorage.getItem('userDetails') == null) {
        return (
            <div className="container primary login">
                <div className="row mb-4">
                    <div className="col-lg-12 d-flex justify-content-center mb-3">
                        <img className="brand" src={Brand} alt="colLAB" />
                    </div>
                </div>

                <form className="form-login" onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col">
                            <p className="login-lead">
                                <strong>Enter your details to proceed further.</strong>
                            </p>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col">
                            <input
                                className="form-control form-control-lg"
                                type="text"
                                name="user"
                                value={userLogin.user}
                                onChange={handleChange}
                                placeholder="Username or email"
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col">
                            <input
                                className="form-control form-control-lg"
                                type="password"
                                name="pass"
                                value={userLogin.pass}
                                onChange={handleChange}
                                placeholder="Password"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col d-flex">
                            <input className="form-login-check" type="checkbox" />
                            <span className="span-login">
                                <p>Keep me signed in</p>
                            </span>
                        </div>
                        <div className="col">
                            <p className="text-end">
                                <a href="#">Forgot password?</a>
                            </p>
                        </div>
                    </div>

                    <div className="row mt-2 mb-4">
                        <div className="col">
                            <button
                                type="submit"
                                className="btn btn-lg btn-primary login-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging in…' : 'Log In'}
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col d-flex">
                            <p>
                                Don't have an account?
                                <span className="span-login">
                                    <Link to="/registration">Sign up</Link>
                                </span>
                            </p>
                        </div>
                    </div>
                </form>

                {userServerMessage()}
                {userServerRegisterMessage()}
            </div>
        );
    } else {
        navigate('/dashboard', { replace: true });
        return null;
    }
}
