import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';

export default function CreateJob() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [jobStatus, setJobStatus] = useState("");
    const [createComment, setCreateComment] = useState('');
    const [createCommentDetails, setCreateCommentDetails] = useState('');
    const [createJob, setCreateJob]  = useState({
        title: '',
        jobs_institution: '',
        jobs_job_type: '',
        jobs_benefits: '',
        jobs_languages: '',
        jobs_work_location: '',
        jobs_street_address: '',
        jobs_address_line_2: '',
        jobs_city: '',
        jobs_country: '',
        jobs_schedule: '',
        jobs_instructions_to_apply: '',
        jobs_application_deadline: '',
        jobs_exptected_start_date: '',
        jobs_applied_users: '',
        short_description: '',
    })
    const [ getCountries, setGetCountries ] = useState([]);

    // Retreive cities from api
    useEffect(() => {
        axios.get("https://restcountries.com/v3.1/all")
        .then((response) => {
            setGetCountries(response.data);
        })
        .catch((error) => {
        })
    }, [])

    //   Handle Change
  function handleChange(e) {
    const {name, value} = e.target
    setCreateJob(prev => {
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
              `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/jobs`,
                {   
                    'title':  createJob.title,
                    'content': createComment,
                    'excerpt': createJob.short_description,
                    'author': userDetails.id,
                    'status': 'publish',
                    'acf' : {
                        'jobs_institution': createJob.jobs_institution,
                        'jobs_description': createComment,
                        'jobs_job_type': createJob.jobs_job_type,
                        'jobs_benefits': createJob.jobs_benefits,
                        'jobs_languages': createJob.jobs_languages,
                        'jobs_work_location': createJob.jobs_work_location,
                        'jobs_street_address': createJob.jobs_street_address,
                        'jobs_address_line_2': createJob.jobs_address_line_2,
                        'jobs_city': createJob.jobs_city,
                        'jobs_country': createJob.jobs_country,
                        'jobs_schedule': createJob.jobs_schedule,
                        'jobs_instructions_to_apply': createCommentDetails,
                        'jobs_application_deadline': createJob.jobs_application_deadline,
                        'jobs_exptected_start_date': createJob.jobs_exptected_start_date,
                        'jobs_applied_users': '',
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                    }
                }
            )
            .then((response) => {
                setJobStatus("publish")
            })
            .catch((error) => {
            });
    } catch (error) {
        console.error('Error submitting question:', error);
    }
}

const countries = getCountries
.slice()
.sort((a, b) => a.name.common.localeCompare(b.name.common))
.map((country, index) => {
    return (
        <option key={index}>{country.name.common}</option>
    )
})

// TinyMC Handle Change
function handleChangeContent(e) {
    setCreateComment(e.target.getContent());
}

// TinyMC Handle Change
function handleChangeContentDetail(e) {
    setCreateCommentDetails(e.target.getContent());
}
if (userDetails != null) {
    return(
        <>
            <Navigation />
            <main className="create-job">
                <div className="container primary" >
                    <div className="page-filter">
                        <div className="row mb-5">
                            <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash">></span><Link to="/jobs" className="link-dark small">Jobs</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">Create Job</span>
                            </div>
                        </div>
                    </div>
                    <form className="form-create-job mx-auto shadow-lg" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <p className="lead"><strong>Create a Job Posting</strong></p>
                            </div>
                        </div>
                        <p><strong>Job Details:</strong></p>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <input className="form-control form-control-lg" type="text" name="title"  value={createJob.title} onChange={handleChange} aria-label='Job title' placeholder="Job title" disabled={ jobStatus === 'publish' ? true : false} autoComplete='on' required />
                                { createJob.length == 140 ?
                                <p className="small red">Maximum characters reached!</p> : '' }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <input className="form-control form-control-lg" type="text" name="jobs_institution"  value={createJob.jobs_institution} onChange={handleChange} aria-label='Job Institution' placeholder="Name of company/institution" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-6 mb-4">
                                <p className="small m-0"><strong>Job Type:</strong></p>
                                <select name="jobs_job_type" value={createJob.jobs_job_type} onChange={handleChange} className='form-control form-control-lg form-select' aria-label='Job Type' disabled={ jobStatus === 'publish' ? true : false} required>
                                    <option disabled value="">Job type</option>
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Part-time, Full-time</option>
                                </select>
                            </div>    
                            <div className="col-lg-6 mb-4">
                                <p className="small m-0"><strong>Work Location:</strong></p>
                                <select name="jobs_work_location" value={createJob.jobs_work_location} onChange={handleChange} className='form-control form-control-lg form-select' aria-label='Job work location' disabled={ jobStatus === 'publish' ? true : false} required>
                                    <option disabled value="">Work location</option>
                                    <option>In office</option>
                                    <option>Remote</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <textarea rows="7" className="form-control form-control-lg" type="text" name="jobs_benefits"  value={createJob.jobs_benefits} onChange={handleChange} aria-label='Job benefits' placeholder="Benefits and Pay" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required></textarea>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <input className="form-control form-control-lg" type="text" name="jobs_languages"  value={createJob.jobs_languages} onChange={handleChange} aria-label='Job language requirements' placeholder="Language requirements" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <input className="form-control form-control-lg" type="text" name="jobs_schedule"  value={createJob.jobs_schedule} onChange={handleChange} aria-label='Job schedule' placeholder="Work Schedule" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />
                            </div>
                        </div>
                        <p><strong>Job Address:</strong></p>
                        <div className="row">
                            <div className="col-lg-12  mb-4">
                                <input className="form-control form-control-lg" type="text" name="jobs_street_address"  value={createJob.jobs_street_address} onChange={handleChange} aria-label='Job Street Address' placeholder="Street Address" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />
                            </div>
                            <div className="col-lg-12  mb-4">
                                <input className="form-control form-control-lg" type="text" name="jobs_address_line_2"  value={createJob.jobs_address_line_2} onChange={handleChange} aria-label='Address Line 2' placeholder="Address Line 2" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-6  mb-4">
                                <select name="jobs_country" value={createJob.jobs_country}  onChange={handleChange} className='form-control form-select form-control-lg' aria-label="Country" autoComplete="country-name" required>
                                    <option disabled value="">Country</option>
                                    {countries}
                                </select>
                            </div>
                            <div className="col-lg-6  mb-4">
                                <input className="form-control form-control-lg" type="text" name="jobs_city"  value={createJob.jobs_city} onChange={handleChange} aria-label='Job City' placeholder="City" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12  mb-4">
                                <p className="mb-2"><strong>Short Description:</strong></p>
                                <textarea className="form-control form-control-lg" type="text" name="short_description" rows="3"  value={createJob.short_description} onChange={handleChange} aria-label='Job Short Description' placeholder="Short Description" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <p className="mb-2"><strong>Job Description:</strong></p>
                                <Editor
                                    apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                                    data-info="content"
                                    className="form-control form-control-lg" 
                                    init={{
                                    readOnly: jobStatus === 'published' ? true : false,
                                    selector: 'textarea',
                                    placeholder: 'Include company description, position overview, responsibilities, qualifications',
                                    toolbar: 'undo redo | bold italic underline | superscript subscript | alignleft aligncenter alignright | bullist numlist',
                                    }}
                                    onChange={handleChangeContent}
                                />
                            </div> 
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <p className="mb-2"><strong>Instructions to Apply:</strong></p>
                                <Editor
                                    apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                                    data-info="content"
                                    className="form-control form-control-lg" 
                                    init={{
                                    readOnly: jobStatus === 'published' ? true : false,
                                    selector: 'textarea',
                                    placeholder: 'Instructions on how to apply for this job',
                                    toolbar: 'undo redo | bold italic underline | superscript subscript | alignleft aligncenter alignright | bullist numlist',
                                    }}
                                    onChange={handleChangeContentDetail}
                                />
                            </div> 
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <p><strong>Application Deadline</strong></p>
                                <input name="jobs_application_deadline" value={createJob.jobs_application_deadline} onChange={handleChange} className="form-control form-control-lg" type="Date" min={new Date().toISOString().split('T')[0]} aria-label="Applicatiion deadline" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />   
                            </div> 
                        </div>                      
                        <div className="row">
                            <div className="col-12 mb-5">
                                <p><strong>Expected Start Date</strong></p>
                                <input name="jobs_exptected_start_date" value={createJob.jobs_exptected_start_date} onChange={handleChange} className="form-control form-control-lg" type="Date" min={new Date().toISOString().split('T')[0]} aria-label="Expected start date" autoComplete='on' disabled={ jobStatus === 'publish' ? true : false} required />   
                            </div> 
                        </div>
                        { jobStatus === "publish" ? 
                        <div className="alert alert-success mb-5" role="alert">
                            <p>Success! Your job has been published!</p>
                        </div>
                        : ''    
                        }
                        <button className="btn btn-info btn-lg" type="submit" disabled={ jobStatus === 'publish' ? true : false} >Submit</button>
                    </form>                 

                </div>
            </main>
    </>
        );
    } else {
        window.location.replace("/");
      }
};