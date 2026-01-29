import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TailSpin } from "react-loader-spinner";
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";



export default function Request() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const { param1 } = useParams();
    const [ requestDetails, setRequestDetails ] = useState({}); 
    const [ requestorDetails, setRequestorDetails ] = useState([]); 
    const [loading, setLoading] = useState(true);
    const Naviagte = useNavigate()

    // Get menotr information
    useEffect(() => {
      axios({
        url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaborations/${param1}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${userDetails.token}`
          }
      })
      .then((response) => {
        console.log(response);
        setRequestDetails(response.data);
        setLoading(false);
      })
      .catch(err => console.log(err))
    }, []);

     // Get menotr information
     useEffect(() => {
        axios({
          url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${requestDetails?.author}`,
          method: 'GET',
          headers: {
              Authorization: `Bearer ${userDetails.token}`
            }
        })
        .then((response) => {
            setRequestorDetails(response.data);
         
        })
        .catch(err => console.log(err))
      }, []);

  if (userDetails != null) {
    if (loading === false) {
    return(
        <>
            <Navigation user={userDetails} />
            <main className="create-job">
                <div className="container primary" >
                    <div className="page-filter">
                        <div className="row mb-5">
                            <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">></span><Link to="/collaborations" className="link-dark small d-flex align-items-center">Collaborations</Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">{requestDetails?.acf?.collaborations_description.substring(0, 30)}{requestDetails?.acf?.collaborations_description.length > 30 && '...'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-create-job mx-auto" >
                        <div className="row mb-4 d-flex align-items-center">
                            <div className="col-auto mb-4">
                                <img className="mentor-details-img" src={requestorDetails?.acf?.user_profile_picture} alt={requestorDetails?.name} />
                            </div>
                            <div className="col-auto mb-4">
                                <h1>{requestorDetails?.name}</h1>
                                <p className="m-0">{requestorDetails?.acf?.['user_mentor_current_position']} at {requestorDetails?.acf?.['user_mentor_current_company']}</p>
                                <p className="m-0">{requestorDetails?.acf?.['user-city']}{requestorDetails?.acf?.['user-country-of-residence']?.length > 0 ? ',' : ''} {requestDetails?.acf?.['user-country-of-residence']}</p>
                            </div>
                            <hr></hr>
                        </div>
                        <div className="row mb-4">
                            <div className="col-lg-12 mb-4">
                                <h1>{requestDetails?.title?.rendered}</h1>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Location:</strong> {requestDetails?.acf?.collaborations_location}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Compensation:</strong> {requestDetails?.acf?.collaborations_pay}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Description:</strong><br></br> {requestDetails?.acf?.['collaborations_features']}</span>
                            </div>                         
                            <div className="col-lg-12 mb-4">
                                <span><strong>Start date:</strong> {requestDetails?.acf?.collaborations_due_date}</span>
                            </div>        
                            <div className="col-lg-12 mb-4">
                                <span><strong>Deadline:</strong> {requestDetails?.acf?.collaborations_deadline}</span>
                            </div>                
                        </div>    
                        <div className="row mb-4 d-flex align-items-center">
                            <div className="col-auto">
                                {/* <button className={`btn btn-info btn-lg ${chatID === undefined ? 'display-block' : 'display-none'}`} onClick={''}>Sign up with mentor</button>
                                <Link className={`btn btn-info btn-lg ${chatID === undefined ? 'display-none' : 'display-block'}`} to={`/mentor-chat/${chatID}`} >Return to chat</Link> */}
                            </div> 
                            <div className="col-auto">
                                <Link to={"/collaborations"}><button className="btn btn-danger btn-lg"><strong>Back</strong></button></Link>
                            </div> 
                        </div>          
                    </div>                 
                </div>
            </main>
    </>
        );
    } else {
        return (
          <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#0f9ed5"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{position: "absolute", top: 0, left: 0, right: 0, left: 0}}
          wrapperClass="spinner"
          />
        )
      }
      } else {
        window.location.replace("/");
      }
};