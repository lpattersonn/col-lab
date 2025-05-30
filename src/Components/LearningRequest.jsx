import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import SectionImage from "../Images/rb_2582.png";
import { reducePoints } from "../helper";
import axios from "axios";

export default function LearningRequest() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    const [requestSent, setRequestSent] = useState("No");
    const [createLearningRequest, setCreateLearningRequest]  = useState({
        'learning_description': '',
        'learning_features': '',
        'learning_pay': '',
        'learning_perk': '',
        'learning_deadline': ''
    });

    // Handle Change
    function handleChange(e) {
        const {name, value} = e.target
        setCreateLearningRequest(prev => {
            return (
                { ...prev, [name]: value}
            )
        })
    }

    // Create learning request
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await reducePoints(userDetails, 5, 5); 
        
        if (success === true) {
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/learning-center/`,
                    {   
                        'title':  createLearningRequest.learning_description,
                        'content': createLearningRequest.learning_features,
                        'excerpt': createLearningRequest.learning_features,
                        'author': userDetails.id,
                        'status': 'publish',
                        'acf' : {
                            'description': createLearningRequest.learning_description,
                            'features': createLearningRequest.learning_features,
                            'pay': createLearningRequest.learning_pay,
                            'perk': createLearningRequest.learning_perk,
                            'deadline': createLearningRequest.learning_deadline
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${userDetails.token}`
                        }
                    }
                );
                setRequestSent(response.status);
            } catch (error) {
                console.error('Error submitting request:', error);
            }
        }
    }
    

if (userDetails != null) {
    return(
        <>
            <Navigation />
            <main className="create-collaboration" style={{marginBottom: "0", paddingBottom: "0",}}>
                <div className="container primary" >
                    <div className="page-filter">
                        <div className="row mb-5">
                            <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">></span><Link className="link-dark small d-flex align-items-center" to="/learning-center">Learning Center</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">Learning Request</span>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h1><strong>Grow your skill set by learning from your peers.</strong></h1>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-6">
                            <img className="collaboration-page_image" src={SectionImage} alt="Image of scientist" role="presentation" />
                        </div>
                        <div className="col-lg-6">
                            <form className="form-create-job points mx-auto shadow-lg p-5" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="learning_description"><strong>What would you like to learn? (1 skill max.)</strong></label>
                                        <input name="learning_description" id="learning_description" value={createLearningRequest.learning_description} onChange={handleChange} className='form-control form-control-lg' aria-label='Descritpion' placeholder="ex. Flow cytometry" type="text" disabled={ requestSent === 201 ? true : false} required />

                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="learning_features"><strong>Description</strong></label>
                                        <textarea name="learning_features" id="learning_features" rows="7" value={createLearningRequest.learning_features} onChange={handleChange} className='form-control form-control-lg' aria-label='Descritpion' placeholder="Explain in brief detail what you would like to learn (150 characters max)." type="text" disabled={ requestSent === 201 ? true : false} required />
                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12  mb-4">
                                    <label htmlFor="learning_deadline"><strong>I would like to learn this skill by</strong></label>
                                    <input name="learning_deadline" id="learning_deadline" value={createLearningRequest.learning_deadline} onChange={handleChange} className='form-control form-control-lg' aria-label='Application deadline' type="date" min={new Date().toISOString().split('T')[0]} disabled={ requestSent === 201 ? true : false} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="learning_pay"><strong>Meeting Preference</strong></label>
                                        <select defaultValue="" name="learning_pay" id="learning_pay" value={createLearningRequest.learning_pay} onChange={handleChange} aria-label="Compensation" disabled={requestSent === 201 ? true : false} className="form-control form-control-lg form-select" required>
                                            <option disabled value="">Choose an option</option>
                                            <option>Virtual</option>
                                            <option>In Person</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="btn btn-info btn-lg" type="submit" disabled={ requestSent === 201 ? true : false} >Submit</button>
                                { requestSent === 201 ? 
                                <div className="alert alert-success mt-4" role="alert">
                                    <p>Success! Your training request has been created!</p>
                                </div>
                                : ''    
                                }
                            </form>      
                        </div>           
                    </div>
                </div>
            </main>
        </>
    );
    } else {
        window.location.replace("/");
    }
};