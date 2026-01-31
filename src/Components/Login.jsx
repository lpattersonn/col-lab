import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../Images/colLAB-logo.svg';

export default function Login() {
    const navigate = useNavigate();

    const [userDetails, setUserDetails] = useState(null);
    const [serverMessage, setServerMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [userLogin, setUserLogin] = useState({
        user: '',
        pass: '',
    });

    const [apiSettings, setApiSettings] = useState(null);

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

    // 🔐 Login request
    useEffect(() => {
        if (!apiSettings?.user || !apiSettings?.pass) {
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('username', apiSettings.user);
        formData.append('password', apiSettings.pass);

        axios
            .post(
                `${process.env.REACT_APP_API_URL}/wp-json/jwt-auth/v1/token`,
                formData
            )
            .then((response) => {
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
            .catch((err) => {
                setServerMessage(
                    err?.response?.data?.message || 'Login failed.'
                );
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }, [apiSettings]);

    // ✅ Redirect after login OR if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('userDetails');
        if (userDetails || storedUser) {
            navigate('/', { replace: true });
        }
    }, [userDetails, navigate]);

    function userServerMessage() {
        if (!serverMessage) return null;
        return (
            <div className="row mb-4">
                <div className="col">
                    <div className="alert alert-danger">
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
                    <div className="alert alert-success">
                        <p className="m-0">{msg}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container primary login">
            <div className="form-container">
            <div className="row">
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
                            required
                        />
                    </div>
                </div>
             <div className="row mb-3">
    <div className="col position-relative">
        <input
            className="form-control form-control-lg pe-5"
            type={showPassword ? 'text' : 'password'}
            name="pass"
            value={userLogin.pass}
            onChange={handleChange}
            placeholder="Password"
            required
        />

        <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="btn btn-link position-absolute"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
                top: '50%',
                right: '12px',
                transform: 'translateY(-50%)',
                padding: 0,
                lineHeight: 0,
                width: "fit-content",
                color: '#6c757d',
            }}
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
                    <path d="M1 1l22 22" />
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12a11.64 11.64 0 0 1 3.06-4.94" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.64 11.64 0 0 1-2.06 3.06" />
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
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )}
        </button>
    </div>
</div>
       <div className="col left mb-3" style={{textAlign: "left !important"}}>
            <span><Link to="/registration">Forgot password?</Link></span>
        </div>

                <button
                    type="submit"
                    className="btn btn-lg btn-primary login-btn w-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Logging in…' : 'Log In'}
                </button>

                <div className="row mt-4">
                    <div className="col left" style={{textAlign: "left !important"}}>
                        <span>Don't have an account?</span> <span><Link to="/registration">Sign up</Link></span>
                    </div>
                </div>
            </form>
            </div>
            {userServerMessage()}
            {userServerRegisterMessage()}
        </div>
    );
}
