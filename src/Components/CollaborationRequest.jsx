import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";


export default function CollaborationRequest() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [requestSent, setRequestSent] = useState("No");
    const [createCollaborationRequest, setCreateCollaborationRequest]  = useState({
        'collaborations_description': '',
        'collaborations_due_date': '',
        'collaborations_pay': '',
        'collaborations_perk': '',
        'collaborations_location': '',
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
                        'collaborations_due_date': createCollaborationRequest.collaborations_due_date,
                        'collaborations_pay': createCollaborationRequest.collaborations_pay,
                        'collaborations_perk': createCollaborationRequest.collaborations_perk,
                        'collaborations_location': createCollaborationRequest.collaborations_location,
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
            <main className="create-collaboration">
                <div className="container primary" >
                    <div className="page-filter">
                        <div className="row mb-5">
                            <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><Link className="link-dark small d-flex align-items-center" to="/collaborations">Collaborations</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">Request Collaboration</span>
                            </div>
                        </div>
                    </div>
                    <form className="form-create-job mx-auto" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <h1><strong>Seek collaboration opportunities with your peers. Two heads are better than one!</strong></h1>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input name="collaborations_description" value={createCollaborationRequest.collaborations_description} onChange={handleChange} className='form-control form-control-lg' placeholder="Type your request briefly (150 characters max.)" aria-label='Descritpion' type="text" disabled={ requestSent === 201 ? true : false} required />
                                <p>*Please keep project explanations sufficiently vague to avoid scooping</p>
                            </div>    
                        </div>
                        <div className="row">
                            <div className="col-lg-12  mb-4">
                            <input name="collaborations_due_date" value={createCollaborationRequest.collaborations_due_date} onChange={handleChange} className='form-control form-control-lg' aria-label='Requested date' type="date" min={new Date().toISOString().split('T')[0]} disabled={ requestSent === 201 ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input className="form-control form-control-lg" type="text" name="collaborations_pay"  value={createCollaborationRequest.collaborations_pay} onChange={handleChange} aria-label='Collaboration pay' placeholder="Compensation" autoComplete='on' disabled={ requestSent === 201 ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input className="form-control form-control-lg" type="text" name="collaborations_location"  value={createCollaborationRequest.collaborations_location} onChange={handleChange} aria-label='Collaboration location' placeholder="Collaboration location" autoComplete='on' disabled={ requestSent === 201 ? true : false} required />
                            </div>
                        </div>
                        { requestSent === 201 ? 
                        <div className="alert alert-success mb-5" role="alert">
                            <p>Success! Your collaboration request has been created!</p>
                        </div>
                        : ''    
                        }
                        <button className="btn btn-info btn-lg" type="submit" disabled={ requestSent === 201 ? true : false} >Submit</button>
                    </form>                 

                </div>
            </main>
    </>
        );
    } else {
        window.location.replace("/");
      }
};