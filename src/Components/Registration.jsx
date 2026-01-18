import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { scienceBranches } from '../helper';

export default function Registration() {
    const DEGREE_OPTIONS = [
        'High School',
        'Undergraduate Student',
        'Bachelor’s',
        'Master’s',
        'PhD Candidate',
        'PhD',
        'Postdoctoral Researcher',
        'Other',
    ];

    const [userLogin, setUserLogin] = useState({
        username: '',
        first_name: '',
        last_name: '',
        name: '',
        user_birth_date: '',
        user_gender: '',
        user_job_title: '',
        user_job_Insitution: '',
        user_country_of_residence: '',
        user_city: '',
        user_field: '',
        user_degree: '',
        user_skills: '',
        email: '',
        password: '',
        retype_password: '',
    });

    const [apiSettings, setApiSettings] = useState({});
    const [serverMessage, setServerMessage] = useState('');

    // 🌍 Country / City API state
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);

    // ✅ Auto-generate display name
    useEffect(() => {
        const fullName = `${userLogin.first_name} ${userLogin.last_name}`.trim();
        setUserLogin((prev) => ({
            ...prev,
            name: fullName,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLogin.first_name, userLogin.last_name]);

    function handleChange(e) {
        setServerMessage('');
        const { name, value } = e.target;

        // When country changes, reset city
        if (name === 'user_country_of_residence') {
            const selectedCountry = countries.find((c) => c.country === value);
            setCities(selectedCountry?.cities || []);
            setUserLogin((prev) => ({
                ...prev,
                user_country_of_residence: value,
                user_city: '',
            }));
            return;
        }

        setUserLogin((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setApiSettings({ ...userLogin });
    }

    // 🔐 Password validation
    useEffect(() => {
        if (userLogin.retype_password && userLogin.retype_password !== userLogin.password) {
            setServerMessage('Passwords do not match');
        } else {
            setServerMessage('');
        }
    }, [userLogin.password, userLogin.retype_password]);

    // 🧑 Create WP User
    useEffect(() => {
        if (!apiSettings.username) return;

        axios({
            url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`,
            method: 'POST',
            data: {
                username: apiSettings.username,
                password: apiSettings.password,
                first_name: apiSettings.first_name,
                last_name: apiSettings.last_name,
                name: apiSettings.name,
                email: apiSettings.email,
                roles: 'editor',
                acf: {
                    'user-birth_date': apiSettings.user_birth_date,
                    'user-gender': apiSettings.user_gender,
                    'user-job-title': apiSettings.user_job_title,
                    'user-job-Insitution': apiSettings.user_job_Insitution,
                    'user-country-of-residence': apiSettings.user_country_of_residence,
                    'user-city': apiSettings.user_city,
                    'user_field': apiSettings.user_field,
                    'user-degree': apiSettings.user_degree,
                    'user-skills': apiSettings.user_skills,
                },
            },
        })
            .then(() => {
                localStorage.setItem(
                    'registrationMessage',
                    'Thank you for registering with us. You are now a member of our community. Login to explore collabb.'
                );
                window.location.replace('/');
            })
            .catch((err) => {
                setServerMessage(err?.response?.data?.message || 'Error');
            });
    }, [apiSettings]);

    // 🌍 Fetch countries + cities (countriesnow API)
    useEffect(() => {
        axios
            .get('https://countriesnow.space/api/v0.1/countries')
            .then((res) => {
                setCountries(res?.data?.data || []);
            })
            .catch(() => {});
    }, []);

    const countryOptions = countries
        .slice()
        .sort((a, b) => a.country.localeCompare(b.country))
        .map((c, i) => (
            <option key={i} value={c.country}>
                {c.country}
            </option>
        ));

    const cityOptions = cities.map((city, i) => (
        <option key={i} value={city}>
            {city}
        </option>
    ));

    const fieldOptions = scienceBranches().map((f, i) => (
        <option key={i} value={f}>
            {f}
        </option>
    ));

    return (
        <div className="container primary register">
            <div className='form-container-register'>
            <div className="row mb-4">
                <div className="col">
                    <h1 className="text-center mb-3">
                        Become a COLLABB member
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-registration mb-5">
                <div className="row">
                    <div className="col">
                        <p className="login-lead">
                            <strong>Tell us a bit more about yourself...</strong>
                        </p>
                    </div>
                </div>

                {/* First / Last */}
                <div className="row">
                    <div className="col-lg-6">
                        <input
                            name="first_name"
                            value={userLogin.first_name}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="text"
                            placeholder="First Name"
                            aria-label="First Name"
                            autoComplete="given-name"
                            required
                        />
                    </div>
                    <div className="col-lg-6">
                        <input
                            name="last_name"
                            value={userLogin.last_name}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="text"
                            placeholder="Last Name"
                            aria-label="Last Name"
                            autoComplete="family-name"
                            required
                        />
                    </div>

                    {/* Auto generated name */}
                    <input
                        name="name"
                        value={userLogin.name}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        type="hidden"
                        autoComplete="off"
                        aria-label="User Name"
                    />
                </div>

                {/* Birthdate / Gender */}
                <div className="row">
                    <div className="col-lg-6">
                        <p className="small form-registration-label">Enter Your Birth Date</p>
                        <input
                            name="user_birth_date"
                            value={userLogin.user_birth_date}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="date"
                            placeholder="Birthday"
                            aria-label="Birthday"
                            autoComplete="bday"
                            required
                        />
                    </div>
                    <div className="col-lg-6">
                        <select
                            name="user_gender"
                            value={userLogin.user_gender}
                            onChange={handleChange}
                            className="form-control form-select"
                            aria-label="Gender Selection"
                            required
                        >
                            <option value="" disabled>
                                Choose a gender
                            </option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Prefer Not To Say">Prefer Not To Say</option>
                        </select>
                    </div>
                </div>

                {/* Job title / Institution */}
                <div className="row">
                    <div className="col-lg-6">
                        <input
                            name="user_job_title"
                            value={userLogin.user_job_title}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="text"
                            placeholder="Job Title"
                            aria-label="Job Title"
                            autoComplete="organization-title"
                            required
                        />
                    </div>
                    <div className="col-lg-6">
                        <input
                            name="user_job_Insitution"
                            value={userLogin.user_job_Insitution}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="text"
                            placeholder="Institution"
                            aria-label="Institution"
                            autoComplete="organization"
                            required
                        />
                    </div>
                </div>

                {/* 🌍 Country + City */}
                <div className="row">
                    <div className="col-lg-6">
                        <select
                            name="user_country_of_residence"
                            value={userLogin.user_country_of_residence}
                            onChange={handleChange}
                            className="form-control form-select"
                            aria-label="Country"
                            autoComplete="country-name"
                            required
                        >
                            <option value="" disabled>
                                Country of residence
                            </option>
                            {countryOptions}
                        </select>
                    </div>

                    <div className="col-lg-6">
                        <select
                            name="user_city"
                            value={userLogin.user_city}
                            onChange={handleChange}
                            className="form-control form-select"
                            aria-label="City"
                            required
                            disabled={!cities.length}
                        >
                            <option value="" disabled>
                                {cities.length ? 'Select city' : 'Select a country first'}
                            </option>
                            {cityOptions}
                        </select>
                    </div>
                </div>

                {/* Field */}
                <div className="row">
                    <div className="col">
                        <p className="small m-0">
                            <strong>Field of Research</strong>
                        </p>
                        <select
                            className="form-control form-control-lg form-select"
                            name="user_field"
                            aria-label="Field of Research"
                            value={userLogin.user_field}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Choose field
                            </option>
                            {fieldOptions}
                        </select>
                    </div>
                </div>

                {/* ✅ Degree (Automated) */}
                <div className="row">
                    <div className="col">
                        <select
                            name="user_degree"
                            value={userLogin.user_degree}
                            onChange={handleChange}
                            className="form-control form-control-lg form-select"
                            aria-label="Current Degree Level"
                            required
                        >
                            <option value="" disabled>
                                Current Degree Level
                            </option>
                            {DEGREE_OPTIONS.map((degree, i) => (
                                <option key={i} value={degree}>
                                    {degree}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Skills */}
                <div className="row">
                    <div className="col">
                        <textarea
                            name="user_skills"
                            value={userLogin.user_skills}
                            rows="4"
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            placeholder="Indicate up to 20 skills/areas of expertise, separate skills with a comma."
                            aria-label="Indicate up to 20 skills/areas of expertise"
                            required
                        />
                    </div>
                </div>

                {/* Account details */}
                <div className="row">
                    <div className="col-lg-12">
                        <p>
                            <strong>Account Details:</strong>
                        </p>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <input
                            name="username"
                            value={userLogin.username}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="text"
                            placeholder="Username"
                            aria-label="User Name"
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <input
                            name="email"
                            value={userLogin.email}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="email"
                            placeholder="Email"
                            aria-label="Email"
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-6">
                        <input
                            name="password"
                            value={userLogin.password}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="password"
                            placeholder="Password"
                            aria-label="Password"
                            required
                        />
                    </div>
                    <div className="col-lg-6">
                        <input
                            name="retype_password"
                            value={userLogin.retype_password}
                            onChange={handleChange}
                            className="form-control form-control-lg"
                            type="password"
                            placeholder="Retype password"
                            aria-label="Retype Password"
                            required
                        />
                    </div>
                </div>

                {serverMessage && (
                    <div className="row mt-3">
                        <div className="col-lg-12">
                            <div className="alert alert-danger" role="alert">
                                <p className="m-0">{serverMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row mt-2">
                    <div className="col">
                        <button
                            type="submit"
                            className="btn btn-lg btn-primary login-btn w-100"
                            disabled={!!serverMessage}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col d-flex">
                        <p>
                            By clicking ‘Sign Up’, you are agreeing to our{' '}
                            <a href="#">Terms of Use</a> and{' '}
                            <a href="#">Privacy Policy</a>.
                        </p>
                    </div>
                </div>

                <div className="row">
                    <div className="col d-flex">
                        <p>
                            Already have an account?
                            <span className="span-login">
                                <Link to="/"> Sign in</Link>
                            </span>
                        </p>
                    </div>
                </div>
            </form>
            </div>
        </div>
    );
}
