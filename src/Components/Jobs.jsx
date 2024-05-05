import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import axios from "axios";
import { Tab, initMDB } from "mdb-ui-kit";

export default function Jobs() {
    const [search, setSearch] = useState('');
    const [jobs, setJobs] = useState([]);
    
    useEffect(() => {
        initMDB({ Tab });
    }, []);

      // Api for users
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/jobs`)
    .then((response) => {
     setJobs(response.data);
     console.log(jobs)
    })
    .catch()
  }, [search])

// Active Jobs
  const activeJobs = jobs.map((job, index) => {
    let posted = Date.now() - new Date(job.date);
    let days = Math.floor(posted/(86400 * 1000));

    let deadlineString = job.acf.jobs_application_deadline;
    // Extract year, month, and day from the string
    let year = deadlineString.substring(0, 4);
    let month = deadlineString.substring(4, 6) - 1; // Month is 0-indexed in JavaScript
    let day = deadlineString.substring(6, 8);
    
    // Create a new Date object
    let deadline = new Date(year, month, day);
    
    // Convert the date to epoch time
    let deadlineDate = deadline.getTime();

    if ( Date.now() <= deadlineDate ) { 
        return (
            <div className="card get-help-item mb-4" key={index}>
                <div className="card-body job">
                    <div className="row">
                        <div className='col-lg-3 d-flex align-items-center'>
                            <div className='get-help'>
                                <strong>{job.title.rendered}</strong>
                            </div>
                        </div>
                        <div className='col-lg-5 d-flex align-items-center'>
                            {job.acf.jobs_institution}
                        </div>
                        <div className='col-lg-2 d-flex align-items-center align-items-center'>
                            {job.acf.jobs_work_location}
                        </div>
                        <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                            {days == 0 ? "Posted today" : `${days}d ago`}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
  });

// Expired Jobs
  const expiredJobs = jobs.map((job, index) => {
    let posted = Date.now() - new Date(job.date);
    let days = Math.floor(posted/(86400 * 1000));

    let deadlineString = job.acf.jobs_application_deadline;
    // Extract year, month, and day from the string
    let year = deadlineString.substring(0, 4);
    let month = deadlineString.substring(4, 6) - 1; // Month is 0-indexed in JavaScript
    let day = deadlineString.substring(6, 8);
    
    // Create a new Date object
    let deadline = new Date(year, month, day);
    
    // Convert the date to epoch time
    let deadlineDate = deadline.getTime();

    if ( Date.now() > deadlineDate) { 
        return (
            <div className="card get-help-item mb-4" key={index}>
                <div className="card-body job">
                    <div className="row">
                        <div className='col-lg-3 d-flex align-items-center'>
                            <div className='get-help'>
                                <strong>{job.title.rendered}</strong>
                            </div>
                        </div>
                        <div className='col-lg-5 d-flex align-items-center'>
                            {job.acf.jobs_institution}
                        </div>
                        <div className='col-lg-2 d-flex align-items-center align-items-center'>
                            {job.acf.jobs_work_location}
                        </div>
                        <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                            {days == 0 ? "Posted today" : `${days}d ago`}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
  });

    return(
    <>
        <Navigation />
        <main className="jobs">
            <div className="container primary">
                <div className="page-filter">
                    <div className="row mb-5">
                        <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><svg className="back-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>Home</Link><span className="breadcrumb-slash">/</span><span className="small">Jobs</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <input type="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                setSearch(e.target.value)
                            }} />
                        </div>
                        <div className="col-lg-6 d-flex justify-content-end">
                            <button className="btn btn-info btn-lg">Create a Job Posting</button>
                        </div>
                    </div>
                </div>
                <div className="jobs-section mt-5">
                    <ul className="nav nav-tabs mb-5" id="ex1" role="tablist">
                        <li className="nav-item" role="presentation">
                            <a data-mdb-tab-init className="nav-link active" id="ex1-tab-1" href="#ex1-tabs-1" role="tab" aria-controls="ex1-tabs-1" aria-selected="true" > Active Job Postings </a>
                        </li>
                        <li className="nav-item" role="presentation">
                            <a data-mdb-tab-init className="nav-link" id="ex1-tab-2" href="#ex1-tabs-2" role="tab" aria-controls="ex1-tabs-2" aria-selected="false" >Expired Job Postings </a>
                        </li>
                    </ul>
                    <div className="tab-content" id="ex1-content">
                        <div className="tab-pane fade show active" id="ex1-tabs-1" role="tabpanel" aria-labelledby="ex1-tab-1">
                            {activeJobs}
                        </div>
                        <div className="tab-pane fade" id="ex1-tabs-2" role="tabpanel" aria-labelledby="ex1-tab-2">
                            {expiredJobs}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>
    );

}