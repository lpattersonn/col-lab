import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TailSpin } from "react-loader-spinner";
import { faClock, faLocationDot, faHouse } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';



export default function CreateJob() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const { param1 } = useParams();
    const [ jobDetails, setJobDetails ] = useState(); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      api({
        url: `/wp-json/wp/v2/job/${param1}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userDetails.token}`
        } 
      })
      .then((response) => {
        setJobDetails(response.data);
        setLoading(false);
      })
      .catch(err => console.log(err))
    }, []);

    // Handle Check
    function handelCheckedChange(e) {
        let checked = e.target.checked;
        if (checked === true) {
            api.post(`/wp-json/wp/v2/job/${param1}`,{acf: {
                'jobs_applied_users': `${jobDetails?.acf?.jobs_applied_users} ${JSON.stringify(userDetails.id)} `
              }
            },
            {
                headers: {
                    Authorization: `Bearer ${userDetails.token}`
                }
            } 
              )
              .then(res => {
                setJobDetails(res.data)})
              .catch(err => {console.log(err)})
        }
    }

  function DateToReadable(param) {
    const dateString = param;
    const year = dateString?.substring(0, 4);
    const month = dateString?.substring(4, 6);
    const day = dateString?.substring(6, 8);

    const date = new Date(`${year}-${month}-${day}`);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate
  }
 
  let seeIfchecked = jobDetails?.acf?.jobs_applied_users?.split(' ');
    
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
                                <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash">></span><Link className="link-dark small d-flex align-items-center" to="/jobs">Jobs</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">{jobDetails?.title?.rendered.slice(0, 15)}{jobDetails?.title?.rendered.length > 15 ? '...' : ''}</span>
                            </div>
                        </div>
                    </div>
                    <form className="form-create-job mx-auto shadow-lg" >
                        <div className="row">
                            <div className="col-12 mb-4">
                                <h1>{jobDetails?.title?.rendered}</h1>
                                <span>{jobDetails?.acf?.jobs_institution}</span>
                                <br></br>
                                <span><FontAwesomeIcon icon={faLocationDot}/> {jobDetails?.acf?.jobs_city}, {jobDetails?.acf?.jobs_country}</span><span></span>
                                <br></br>
                                <hr></hr>
                            </div>
                        </div>
                        <h2 className="lead mb-4">Job Details</h2>

                        <div className="row mb-4">
                            <div className="col-lg-12 mb-4">
                                <span><strong>Office location:</strong> {jobDetails?.acf?.jobs_address_line_2}{ jobDetails?.acf?.jobs_address_line_2 ? '-' : ''}{jobDetails?.acf?.jobs_street_address}{jobDetails?.acf?.jobs_street_address ? ', ': ''}{jobDetails?.acf?.jobs_city}, {jobDetails?.acf?.jobs_country}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Work location:</strong> {jobDetails?.acf?.jobs_work_location}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Job type:</strong> {jobDetails?.acf?.jobs_job_type}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Benefits and pay:</strong></span>
                                <p className="m-0">{jobDetails?.acf?.jobs_benefits}</p>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Job language requirements:</strong> {jobDetails?.acf?.jobs_languages}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Job schedule:</strong> {jobDetails?.acf?.jobs_schedule}</span>                            
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Expected start date:</strong> {DateToReadable(jobDetails?.acf?.jobs_exptected_start_date)}</span>
                            </div>
                        <hr></hr>
                        </div>
                        <div className="row mb-4">
                            <div className="col-12 mb-4">
                                <p className="lead">Full job description</p>
                                <div dangerouslySetInnerHTML={{ __html: jobDetails?.acf?.jobs_description }} />
                            </div> 
                        <hr></hr>
                        </div>
                        <div className="row mb-4">
                            <div className="col-12 mb-4">
                                <p className="lead"><strong>Instructions to apply</strong></p>
                                <div dangerouslySetInnerHTML={{ __html: jobDetails?.acf?.jobs_instructions_to_apply }} />
                            </div> 
                        <hr></hr>
                        </div>
                        <div className="row mb-4">
                            <div className="col-12 mb-4">
                                <span><FontAwesomeIcon icon={faClock} /> <strong>Application deadline: </strong>{DateToReadable(jobDetails?.acf?.jobs_application_deadline)}</span>
                            </div> 
                        </div>
                        <div className="row mb-4">
                            <div className="col-lg-6 mb-4 d-flex align-items-center">
                                <input 
                                    className="form-check-input form-control m-0" 
                                    checked={seeIfchecked?.includes(userDetails?.id?.toString())} 
                                    disabled={seeIfchecked?.includes(jobDetails?.id.toString())}
                                    onChange={handelCheckedChange} 
                                    type="checkbox" 
                                    aria-label="Applied to job checkbox" 
                                    id="appliedCheck" 
                                />
                                <span className="form-check-label mx-2" style={{color: '#000'}} htmlFor="appliedCheck">I have applied to this job.</span>
                            </div> 
                        </div> 
                        <div className="row mb-4">
                            <div className="col-lg-6 mr-3 mb-4 d-flex align-items-center">
                                <Link to="/jobs"><button className="btn btn-danger btn-lg"><strong>Back</strong></button></Link>
                            </div> 
                        </div>
                    </form>                 
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
        window.location.replace("/login");
      }
};