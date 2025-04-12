import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { scienceBranches } from '../helper';


export default function Registration() {

    const [userLogin, setUserLogin]  = useState({
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
    })

    const [apiSettings, setApiSettings] = useState({
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
    });

    const [ serverMessage, setServerMessage ] = useState(""); 
    
    const [ getCountries, setGetCountries ] = useState([]);

    function handleChange(e) {
        setServerMessage('')
        const {name, value} = e.target
        setUserLogin(prev => {
            return (
                { ...prev, [name]: value}
            )
        })
    }

    function retypePassword() {
        if (userLogin.retype_password !== userLogin.password) {
            setServerMessage("Passwords do not match");
        } else {
            setServerMessage(""); // Clear the error message if passwords match
        }
        if (userLogin.retype_password.length == 0 && userLogin.retype_password.length == 0) {
            setServerMessage(""); // Clear the error message if passwords match
        }
    }

    useEffect(() => {
        retypePassword();
    }, [userLogin.password, userLogin.retype_password]);
    

    function handleSubmit(e) {
        e.preventDefault();
        setApiSettings({ ...userLogin });
    }

        // Inititate call to wordpress
        useEffect(()=> {
            if (apiSettings.username.length > 0) {
                axios({
                    url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`, 
                    method: 'POST',
                    data: {
                        'username': apiSettings.username,
                        'password': apiSettings.password,
                        'first_name': apiSettings.first_name,
                        'last_name': apiSettings.last_name,
                        'name': apiSettings.name,
                        'email': apiSettings.email,
                        'roles': 'editor',
                        'acf' : {
                            'user-birth_date': apiSettings.user_birth_date,
                            'user-gender': apiSettings.user_gender,
                            'user-job-title':  apiSettings.user_job_title,
                            'user-job-Insitution': apiSettings.user_job_Insitution,
                            'user-country-of-residence': apiSettings.user_country_of_residence,
                            'user-city': apiSettings.user_city,
                            'user_field': apiSettings.user_field,
                            'user-degree': apiSettings.user_degree,
                            'user-skills': apiSettings.user_skills,
                            // 'user-profile-image': defualtProfileImg,
                         }
                    }
                })
                .then(function(response) {
                    localStorage.setItem('registrationMessage', 'Thank you for registering with us. You are now a member of our community. Login to explore collabb.');
                    window.location.replace('/');
                }).catch(function(err) {
                    setServerMessage(err.response.data.message);
                })
            } 
        }, [apiSettings])

        // Retreive cities from api
        useEffect(() => {
            axios.get("https://restcountries.com/v3.1/all")
            .then((response) => {
                setGetCountries(response.data);
            })
            .catch((error) => {
            })
        }, [])

        const countries = getCountries
        .slice()
        .sort((a, b) => a.name.common.localeCompare(b.name.common))
        .map((country, index) => {
            return (
                <option key={index}>{country.name.common}</option>
            )
        })
            // Set Server Messgae
    function userServerMessage() {
        if (serverMessage.length > 0) {
            return (
                <div className="row mb-4">
                    <div className="col-lg-12">
                        <div className="alert alert-danger" role="alert">
                            <p>{serverMessage}</p>
                        </div>
                    </div>
                </div>
            );
        } 
    }

    const optionsArray = 
    scienceBranches().map((options, index) => {
        return (<option key={index}>{options}</option>);
    });

    return (
        <div className="container primary login">
        <div className="row mb-4">
            <div className="col">
                <h1 className="text-center mb-3">Become a <i>ColLabb</i> member</h1>
            </div>
        </div>
        <form onSubmit={handleSubmit} className="form-registration mb-5">
            <div className="row">
                <div className="col">
                    <p className="login-lead"><strong>Tell us a bit more about yourself...</strong></p>
                </div>                
            </div>
            <div className="row">
                <div className="col-lg-6">
                    <input name="first_name" value={userLogin.first_name} onChange={handleChange} className="form-control form-control-lg" type="text" placeholder="First Name" aria-label="First Name" autoComplete='given-name' required />
                </div>                
                <div className="col-lg-6">
                    <input name="last_name" value={userLogin.last_name} onChange={handleChange} className="form-control form-control-lg" type="text" placeholder="Last Name" aria-label="First Name" autoComplete="family-name" required />
                </div>                
                <input name="name" value={userLogin.first_name+' '+userLogin.last_name} onChange={handleChange}  className="form-control form-control-lg" type="hidden" placeholder="Username" autoComplete='off' aria-label="User Name"/>
            </div>
            <div className="row">
                <div className="col-lg-6">
                    <p className="small form-registration-label">Enter Your Birth Date</p>
                    <input name="user_birth_date" value={userLogin.user_birth_date} onChange={handleChange} className="form-control form-control-lg" type="Date" placeholder="Birthday" aria-label="Birthday" autoComplete='bday' required />
                </div>                
                <div className="col-lg-6">
                    <select name="user_gender" value={userLogin.user_gender} onChange={handleChange} className='form-control form-select' aria-label='Gender Selection' required>
                        <option disabled value="">Choose a gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Prefer Not To Say</option>
                    </select>
                </div>                
            </div>
            <div className="row">              
                <div className="col-lg-6">
                    <input name="user_job_title" value={userLogin.user_job_title} onChange={handleChange}  className="form-control form-control-lg" type="text" placeholder="Job Title" aria-label="Job Title" autoComplete='organization-title' required />
                </div>                
                <div className="col-lg-6">
                    <input name="user_job_Insitution" value={userLogin.user_job_Insitution} onChange={handleChange} className="form-control form-control-lg" type="text" placeholder="Institution" aria-label="Institution" autoComplete='organization' required />
                </div>                
            </div>
            <div className="row">
                <div className="col-lg-6">
                    <select name="user_country_of_residence" value={userLogin.user_country_of_residence} onChange={handleChange} className='form-control form-select' aria-label="Country" autoComplete="country-name" required>
                        <option disabled value="">Country of residence</option>
                        {countries}
                    </select>
                </div>                
                <div className="col-lg-6">
                    <input name="user_city" value={userLogin.user_city} onChange={handleChange} className="form-control form-control-lg" type="text" placeholder="City" aria-label="City" autoComplete='city' required />
                </div>                
            </div>
            <div className="row">              
                <div className="col">
                    <p className="small m-0"><strong>Field of Research</strong></p>
                    <select className="form-control form-control-lg form-select" name="user_field" aria-label="Field of Research"  onChange={handleChange} required>
                        <option disabled selected value="">Choose field</option>
                        {optionsArray}
                    </select>        
                </div>        
            </div>
            <div className="row">              
                <div className="col">
                    <input name="user_degree" value={userLogin.user_degree} onChange={handleChange} className="form-control form-control-lg" type="text" placeholder="Current Degree Level" aria-label="Current degree level" autoComplete='off' required />
                </div>                
            </div>
            <div className="row">              
                <div className="col">
                    <textarea name="user_skills" value={userLogin.user_skills} rows="4" onChange={handleChange} className="form-control form-control-lg" placeholder="Indicate up to 20 skills/areas of expertise, seperate skills with a comma." aria-label="Indicate up to 20 skills/areas of expertise" required></textarea>
                </div>                
            </div>
            <div className="row">              
                <div className="col-lg-12">
                    <p><strong>Account Details:</strong></p>
                </div>                
            </div>
            <div className="row">
                <div className="col">
                    <input name="username" value={userLogin.username} onChange={handleChange} className="form-control form-control-lg" type="text" placeholder="Username" aria-label="User Name" required />
                </div>                           
            </div>
            <div className="row">              
                <div className="col">
                    <input name="email" value={userLogin.email} onChange={handleChange} className="form-control form-control-lg" type="Email" placeholder="Email" aria-label="Email" required />
                </div>                
            </div>
            <div className="row">              
                <div className="col-lg-6">
                    <input name="password" value={userLogin.password} onChange={handleChange} className="form-control form-control-lg" type="password" placeholder="Password" aria-label="Password" required />
                </div>
                <div className="col-lg-6">
                    <input name="retype_password" value={userLogin.retype_password} onChange={handleChange} className="form-control form-control-lg" type="password" placeholder="Retype password" aria-label="Retype Password" required />
                </div>                   
            </div>
            {userServerMessage()}
            <div className="row mt-2">
                    <div className="col"> 
                        <button type="submit" className="btn btn-lg btn-primary login-btn" disabled={serverMessage !== ""}>Sign Up</button>
                    </div>                    
            </div>
            <div className="row">
                <div className="col d-flex">                        
                    <p>By clicking ‘Sign Up’, you are agreeing to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.</p>
                </div>                
            </div>
            <div className="row">
                <div className="col d-flex">                        
                    <p>Already have an account?<span className="span-login"><Link to="/">Sign in</Link></span></p>
                </div>                
            </div>
        </form>
    </div>
    );
}