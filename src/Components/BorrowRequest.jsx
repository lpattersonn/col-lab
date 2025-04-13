import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import SectionImage from "../Images/rb_2582.png";
import { reducePoints } from '../helper';
import axios from "axios";

export default function BorrowRequest() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [requestSent, setRequestSent] = useState("No");
    const [createLearningRequest, setCreateLearningRequest]  = useState({
        'borrow_description': '',
        'borrow_features': '',
        'borrow_pay': '',
        'borrow_perk': '',
        'borrow_deadline': ''
    });

    //   Handle Change
  function handleChange(e) {
    const {name, value} = e.target
    setCreateLearningRequest(prev => {
        return (
            { ...prev, [name]: value}
        )
    })
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await reducePoints(userDetails, 5, 5);
    
    if (success === true) {
        try {
            // Upload image if file exists
                const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/borrow-items`,
                    {   
                        'title':  createLearningRequest.borrow_description,
                        'content': "",
                        'excerpt': "",
                        'author': userDetails.id,
                        'status': 'publish',
                        'acf' : {
                            'borrow_description': createLearningRequest.borrow_description,
                            'borrow_features': createLearningRequest.borrow_features,
                            'borrow_pay': createLearningRequest.borrow_pay,
                            'borrow_deadline': createLearningRequest.borrow_deadline
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${userDetails.token}`
                        }
                    }
                )
                .then((response) => {
                    setRequestSent(response.status);
                })
                .catch((error) => {
                });
        } catch (error) {
            console.error('Error submitting question:', error);
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
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">></span><Link className="link-dark small d-flex align-items-center" to="/borrow-items">Borrow Item</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">Request An Item</span>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h1><strong>Request items from your peers to help move your project along.</strong></h1>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-6">
                            <img className="collaboration-page_image" src={SectionImage} alt="Image of scientist" role="presentation" />
                        </div>
                        <div className="col-lg-6">
                            <form className="form-create-job points mx-auto shadow-lg" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="borrow_description"><strong>What item do you need?</strong></label>
                                        <input name="borrow_description" id="borrow_description" value={createLearningRequest.borrow_description} onChange={handleChange} className='form-control form-control-lg' aria-label='Descritpion' placeholder="Please make one borrow request per item" type="text" disabled={ requestSent === 201 ? true : false} required />

                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="borrow_features"><strong>Item Description</strong></label>
                                        <textarea name="borrow_features" id="borrow_features" rows="7" value={createLearningRequest.borrow_features} onChange={handleChange} className='form-control form-control-lg' aria-label='Descritpion' placeholder="Give a detailed description of item as necessary (150 characters max)." type="text" disabled={ requestSent === 201 ? true : false} required />
                                        <label htmlFor="learning_features"><strong>Learning Description</strong></label>
                                        <textarea name="learning_features" id="learning_features" rows="4" value={createLearningRequest.learning_features} onChange={handleChange} className='form-control form-control-lg' aria-label='Descritpion' placeholder="Give a detailed description of your desired learning outcome." type="text" disabled={ requestSent === 201 ? true : false} required />
                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12  mb-4">
                                    <label htmlFor="borrow_deadline"><strong>I would like this item by</strong></label>
                                    <input name="borrow_deadline" id="borrow_deadline" value={createLearningRequest.borrow_deadline} onChange={handleChange} className='form-control form-control-lg' aria-label='Application deadline' type="date" min={new Date().toISOString().split('T')[0]} disabled={ requestSent === 201 ? true : false} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="borrow_pay"><strong>Indicate your intention</strong></label>
                                        <select name="borrow_pay" id="borrow_pay" value={createLearningRequest.borrow_pay} onChange={handleChange} aria-label="Compensation" className="form-control form-control-lg form-select" required>
                                            <option defaultValue disabled value="">Choose an option</option>
                                            <option>For Free</option>
                                            <option>Will Replace</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="btn btn-info btn-lg" type="submit" disabled={ requestSent === 201 ? true : false} >Submit</button>
                                { requestSent === 201 ? 
                                <div className="alert alert-success mt-5" role="alert">
                                    <p>Success! Your borrow request has been created!</p>
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