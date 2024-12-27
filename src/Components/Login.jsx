import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../Images/colLAB-logo.svg';

export default function Login() {
    // Naviagte
    const navigate = useNavigate();

    // Login
    const [userDetails, setuserDetails] = useState('');
    const [serverMessage, setServerMessage] = useState('');

    // Capture User Input
    const [userLogin, setUserLogin] = useState({
        user: '',
        pass: ''
    });

    const [apiSettings, setApiSettings] = useState({
        user: '',
        pass: ''
    });
    
    function handleChange(e) {
        const {name, value} = e.target
        setUserLogin(prev => {
            return (
                { ...prev, [name]: value}
            )
        })
    }

    function handleSubmit(e) {
        e.preventDefault();
        localStorage.removeItem('registrationMessage')
        setApiSettings({ ...userLogin });
    }

    // Inititate call to wordpress
    useEffect(()=> {
        if (apiSettings.user.length > 0) {
            let newFormData =  new FormData();
            newFormData.append('username', apiSettings.user);
            newFormData.append('password', apiSettings.pass);
            // Setup .env variable
            const url = `${process.env.REACT_APP_API_URL}/wp-json/jwt-auth/v1/token`;
            // Axios POST request
            axios.post(url, newFormData)
            .then(function(response) {
                localStorage.setItem('userDetails', JSON.stringify(response.data.data));
                setuserDetails(response?.data?.data);
                
            }).catch(function(err) {
                setServerMessage(err?.response?.data?.message);
                console.log(err);
            })
        } 
    }, [apiSettings])

    // Save JWT and redirect to dashboard page
    useEffect(() => {
        // Check if userDetails is not empty
        if (userDetails.length > 0) {
          window.location.replace("/dashboard");
          
        } 
    }, [userDetails])
    
    // Set Server Messgae
    function userServerMessage() {
        if (serverMessage) {
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
    }

    function userServerRegisterMessage() {
            if (localStorage.getItem('registrationMessage') != null) {
                return (
                    <div className="row">
                        <div className="col">
                            <div className="alert alert-success" role="alert">
                                <p>{localStorage.getItem("registrationMessage")}</p>
                            </div>
                        </div>
                    </div>
                );
            }
    }

    if (localStorage.getItem('userDetails') == null ) {
    return (
        <div className="container primary login">
            <div className="row mb-4">
                <div className="col-lg-12 d-flex justify-content-center mb-3"><img className="brand" src={Brand}/></div>
                <div className="col-lg-12">
                </div>
            </div>
            <form className="form-login"  onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col">
                        <p className="login-lead"><strong>Enter your details to proceed further.</strong></p>
                    </div>                
                </div>
                <div className="row mb-4">
                    <div className="col">
                        <input className="form-control form-control-lg" type="text" name="user" value={userLogin.user} onChange={handleChange} placeholder="Username or email" aria-label="username" autoComplete='username' required />
                    </div>                
                </div>
                <div className="row mb-4">
                    <div className="col">
                        <input className="form-control form-control-lg" type="password" name="pass" value={userLogin.pass} onChange={handleChange} placeholder="Password" aria-label="Passwword" autoComplete='current-password' required />
                    </div>                
                </div>
                <div className="row">
                    <div className="col d-flex">                        
                        <input className="form-login-check" type="checkbox" /> <span className="span-login"><p>Keep me signed in</p></span>
                    </div>   
                    <div className="col">
                        <p className="text-end"><a href="#">Forgot password?</a></p>
                    </div>               
                </div>
                <div className="row mt-2 mb-4">
                        <div className="col"> 
                            <button type="submit" className="btn btn-lg btn-primary login-btn">Log In</button>
                        </div>                        
                </div>
                <div className="row">
                    <div className="col d-flex">                        
                        <p>Don't have an account?<span className="span-login"><Link to="/registration">Sign up</Link></span></p>
                    </div>                
                </div>
            </form>
            {userServerMessage()}
            {userServerRegisterMessage()}
        </div>
    );
    } else {
      window.location.replace('/dashboard');
    }
}
