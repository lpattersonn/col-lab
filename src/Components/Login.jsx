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

    // 👁️ Show/Hide password
    const [showPassword, setShowPassword] = useState(false);

    // User input
    const [userLogin, setUserLogin] = useState({
        user: '',
        pass: '',
    });

    const [apiSettings, setApiSettings] = useState({
        user: '',
        pass: '',
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setUserLogin((prev) => ({ ...prev, [name]: value }));
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

        const formData = new FormData();
        formData.append('username', apiSettings.user);
        formData.append('password', apiSettings.pass);

        const url = `${process.env.REACT_APP_API_URL}/wp-json/jwt-auth/v1/token`;

        axios
            .post(url, formData)
            .then((response) => {
                if (response?.data?.data) {
                    localStorage.setItem('userDetails', JSON.stringify(response.data.data));
                    setUserDetails(response.data.data);
                } else {
                    setServerMessage('Invalid login response.');
                }
            })
            .catch((err) => {
                setServerMessage(err?.response?.data?.message || 'Login failed.');
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
                        <p className="m-0">{serverMessage}</p>
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
                        <p className="m-0">{msg}</p>
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

                    {/* Username */}
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

                    {/* Password + Eye Icon */}
                    <div className="row mb-4">
                        <div className="col position-relative">
                            <input
                                className="form-control form-control-lg pe-5"
                                type={showPassword ? 'text' : 'password'}
                                name="pass"
                                value={userLogin.pass}
                                onChange={handleChange}
                                placeholder="Password"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="btn btn-link position-absolute"
                                style={{
                                    top: '50%',
                                    right: '12px',
                                    transform: 'translateY(-50%)',
                                    padding: 0,
                                    textDecoration: 'none',
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    // 👁️ Eye Off
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.76 1.92-3.35 3.44-4.65" />
                                        <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
                                        <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.64 11.64 0 0 1-2.06 3.06" />
                                        <path d="M1 1l22 22" />
                                    </svg>
                                ) : (
                                    // 👁️ Eye
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Keep me signed in + Forgot password */}
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

                    {/* Submit */}
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

                    {/* Signup */}
                    <div className="row">
                        <div className="col d-flex">
                            <p>
                                Don't have an account?
                                <span className="span-login">
                                    <Link to="/registration"> Sign up</Link>
                                </span>
                            </p>
                        </div>
                    </div>
                </form>

                {userServerMessage()}
                {userServerRegisterMessage()}
            </div>
        );
    }

    // Already logged in
    navigate('/dashboard', { replace: true });
    return null;
}
