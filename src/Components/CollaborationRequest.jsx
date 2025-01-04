import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import SectionImage from "../Images/rb_2582.png";
import axios from "axios";


export default function CollaborationRequest() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [requestSent, setRequestSent] = useState("No");
    const [createCollaborationRequest, setCreateCollaborationRequest]  = useState({
        'collaborations_description': '',
        'collaborations_features': '',
        'collaborations_pay': '',
        'collaborations_perk': '',
        'collaborations_deadline': ''
    });

    //   Handle Change
  function handleChange(e) {
    const {name, value} = e.target
    setCreateCollaborationRequest(prev => {
        return (
            { ...prev, [name]: value}
        )
    })
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Upload image if file exists
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaborations/`,
                {   
                    'title':  createCollaborationRequest.collaborations_description,
                    'content': "",
                    'excerpt': "",
                    'author': userDetails.id,
                    'status': 'publish',
                    'acf' : {
                        'collaborations_description': createCollaborationRequest.collaborations_description,
                        'collaborations_features': createCollaborationRequest.collaborations_features,
                        'collaborations_pay': createCollaborationRequest.collaborations_pay,
                        'collaborations_perk': createCollaborationRequest.collaborations_perk,
                        'collaborations_deadline': createCollaborationRequest.collaborations_deadline
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                    }
                }
            )
            .then((response) => {
                console.log('Question submitted successfully:', response);
                setRequestSent(response.status);
            })
            .catch((error) => {
            });
    } catch (error) {
        console.error('Error submitting question:', error);
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
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">></span><Link className="link-dark small d-flex align-items-center" to="/collaborations">Collaborations</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">Request Collaboration</span>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h1><strong>Collaborate with your peers. Two heads are better than one!</strong></h1>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-6">
                            <img className="collaboration-page_image" src={SectionImage} alt="Image of scientist" role="presentation" />
                        </div>
                        <div className="col-lg-6">
                            <form className="form-create-job points mx-auto" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="collaborations_description"><strong>Type your request briefly (150 characters max).</strong></label>
                                        <input name="collaborations_description" id="collaborations_description" value={createCollaborationRequest.collaborations_description} onChange={handleChange} className='form-control form-control-lg' aria-label='Descritpion' placeholder="ex. Need help creating a knockout cell line." type="text" disabled={ requestSent === 201 ? true : false} required />

                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="collaborations_features"><strong>Description</strong></label>
                                        <textarea name="collaborations_features" id="collaborations_features" rows="7" value={createCollaborationRequest.collaborations_features} onChange={handleChange} className='form-control form-control-lg' aria-label='Descritpion' placeholder="Explain your request in further detail. Please keep project explanations sufficiently vague to avoid scooping." type="text" disabled={ requestSent === 201 ? true : false} required />
                                    </div>    
                                </div>
                                <div className="row">
                                    <div className="col-lg-12  mb-4">
                                    <label htmlFor="collaborations_deadline"><strong>Deadline for project completion</strong></label>
                                    <input name="collaborations_deadline" id="collaborations_deadline" value={createCollaborationRequest.collaborations_deadline} onChange={handleChange} className='form-control form-control-lg' aria-label='Application deadline' type="date" min={new Date().toISOString().split('T')[0]} disabled={ requestSent === 201 ? true : false} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12 mb-4">
                                        <label htmlFor="collaborations_pay"><strong>Compensation</strong></label>
                                        <select name="collaborations_pay" id="collaborations_pay" onChange={handleChange} aria-label="Compensation" className="form-control form-control-lg form-select" required>
                                            <option defaultValue disabled value="">Choose an option</option>
                                            <option>For Free</option>
                                            <option>For Authorship</option>
                                            <option>For Acknowledgment</option>
                                            <option>Negotiable</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="btn btn-info btn-lg" type="submit" disabled={ requestSent === 201 ? true : false} >Submit</button>
                                { requestSent === 201 ? 
                                <div className="alert alert-success mt-5" role="alert">
                                    <p>Success! Your collaboration request has been created!</p>
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