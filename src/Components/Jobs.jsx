import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import axios from "axios";
import { Tab, initMDB } from "mdb-ui-kit";
import { renderedQuestion } from "../helper"
import ReactPaginate from 'react-paginate';

export default function Jobs() {
    const userDetails = localStorage.getItem('userDetails');
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
        })
        .catch( err => {console.log(err)} );
    }, [search])

    // useEffect(() => {
    //     localStorage.setItem('countActiveJobs', 0);
    //     localStorage.setItem('countExpiredJobs', 0);
    // }, []);

// Start paginated active jobs

function ActiveItem({ currentItems }) {
    return (
      <>
        {currentItems.map((job, index) => {
        let posted = Date.now() - new Date(job.date);
        let days = Math.floor(posted/(86400 * 1000));

        let deadlineString = job.acf.jobs_application_deadline;
        var find = '-';
        var re = new RegExp(find, 'g');
        deadlineString  = deadlineString.replace(re, '');

        // Extract year, month, and day from the string
        let year = deadlineString.substring(0, 4);
        let month = deadlineString.substring(4, 6) - 1; // Month is 0-indexed in JavaScript
        let day = deadlineString.substring(6, 8);
        
        // Create a new Date object
        let deadline = new Date(year, month, day);
        
        // Convert the date to epoch time
        let deadlineDate = deadline.getTime();

        if ( Date.now() <= deadlineDate && job.status == "publish" ) { 
            
            localStorage.setItem('countActiveJobs', Number(localStorage.getItem('countActiveJobs')) + 1);
            console.log(localStorage.getItem('countActiveJobs'));

            if (search.length > 0 && job.title.rendered.toLowerCase().includes(search.toLowerCase()) || job.acf.jobs_institution.toLowerCase().includes(search.toLowerCase())) {
                return (
                    <Link to={"/job/"+job["id"]} key={index}>
                        <div className="card get-help-item mb-4">
                            <div className="card-body job">
                                <div className="row">
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div className='get-help'>
                                            <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.title.rendered, search) : job.title.rendered}} /></strong>
                                        </div>
                                    </div>
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.acf.jobs_institution, search) : job.acf.jobs_institution}} />
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center'>
                                        <strong><i>{job?.acf?.jobs_work_location}</i></strong>
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center align-items-center'>
                                    {job?.acf?.jobs_city}, {job?.acf?.jobs_country}
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                                        {days == 0 ? "Posted today" : `${days}d ago`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )
            }
            if (search.length == 0) {
                return (
                    <Link to={"/job/"+job["id"]} key={index}>
                        <div className="card get-help-item mb-4">
                            <div className="card-body job">
                                <div className="row">
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div className='get-help'>
                                            <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.title.rendered, search) : job.title.rendered}} /></strong>
                                        </div>
                                    </div>
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.acf.jobs_institution, search) : job.acf.jobs_institution}} />
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center'>
                                        <strong><i>{job?.acf?.jobs_work_location}</i></strong>
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center align-items-center'>
                                    {job?.acf?.jobs_city}, {job?.acf?.jobs_country}
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                                        {days == 0 ? "Posted today" : `${days}d ago`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )
            }
        }
    }
)
  }
      </>
    );
  }
  
  function ActivePaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    
    const currentItems = jobs.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(jobs.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % jobs.length;
      console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`
      );
      setItemOffset(newOffset);
    };
  
    return (
      <>
        <ActiveItem currentItems={currentItems} />
        <ReactPaginate
          breakLabel="..."
          nextLabel="»"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="«"
          renderOnZeroPageCount={null}
        />
      </>
    );
    
  }
  
// End paginated active jobs

// Start paginated expired jobs

function ExpiredItem({ currentItems }) {
    return (
      <>
        {currentItems.map((job, index) => {
        let posted = Date.now() - new Date(job.date);
        let days = Math.floor(posted/(86400 * 1000));

        let deadlineString = job.acf.jobs_application_deadline;
        var find = '-';
        var re = new RegExp(find, 'g');
        deadlineString  = deadlineString.replace(re, '');

        // Extract year, month, and day from the string
        let year = deadlineString.substring(0, 4);
        let month = deadlineString.substring(4, 6) - 1; // Month is 0-indexed in JavaScript
        let day = deadlineString.substring(6, 8);
        
        // Create a new Date object
        let deadline = new Date(year, month, day);
        
        // Convert the date to epoch time
        let deadlineDate = deadline.getTime();

        if ( Date.now() > deadlineDate && job.status == "publish") { 
            
            localStorage.setItem('countExpiredJobs', Number(localStorage.getItem('countExpiredJobs')) + 1);
            console.log(localStorage.getItem('countExpiredJobs') + 1);

            if (search.length > 0 && job.title.rendered.toLowerCase().includes(search.toLowerCase()) || job.acf.jobs_institution.toLowerCase().includes(search.toLowerCase())) {
                return (
                    <Link to={"/job/"+job["id"]} key={index}>
                        <div className="card get-help-item mb-4">
                            <div className="card-body job">
                                <div className="row">
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div className='get-help'>
                                            <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.title.rendered, search) : job.title.rendered}} /></strong>
                                        </div>
                                    </div>
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.acf.jobs_institution, search) : job.acf.jobs_institution}} />
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center'>
                                        <strong><i>{job?.acf?.jobs_work_location}</i></strong>
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center align-items-center'>
                                        {job?.acf?.jobs_city}, {job?.acf?.jobs_country}
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                                        {days == 0 ? "Posted today" : `${days}d ago`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )
            }
            if (search.length == 0) {
                return (
                    <Link to={"/job/"+job["id"]} key={index}>
                        <div className="card get-help-item mb-4">
                            <div className="card-body job">
                                <div className="row">
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div className='get-help'>
                                            <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.title.rendered, search) : job.title.rendered}} /></strong>
                                        </div>
                                    </div>
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.acf.jobs_institution, search) : job.acf.jobs_institution}} />
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center'>
                                        <strong><i>{job?.acf?.jobs_work_location}</i></strong>
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center align-items-center'>
                                    {job?.acf?.jobs_city}, {job?.acf?.jobs_country}
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                                        {days == 0 ? "Posted today" : `${days}d ago`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )
            }
        }
    }
)
  }
      </>
    );
  }
  
  function ExpiredPaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;
    
    const currentItems = jobs.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(jobs.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % jobs.length;
      console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`
      );
      setItemOffset(newOffset);
    };
  
    return (
      <>
        <ExpiredItem currentItems={currentItems} />
        <ReactPaginate
          breakLabel="..."
          nextLabel="»"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="«"
          renderOnZeroPageCount={null}
        />
      </>
    );
    
  }
  
// End paginated expired jobs


  if (userDetails != null) {
    return(
    <>
        <Navigation />
        <main className="jobs">
            <div className="container primary">
                <div className="page-filter">
                    <div className="row mb-5">
                        <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><svg className="back-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>Home</Link><span className="breadcrumb-slash">/</span><span className="small d-flex align-items-center">Jobs</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <input type="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                setSearch(e.target.value)
                            }} />
                        </div>
                        <div className="col-lg-6 d-flex justify-content-end">
                            <Link to="/create-job"><button className="btn btn-info btn-lg">Create a Job Posting</button></Link>
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
                            {/* {localStorage.getItem('countActiveJobs') > 0 ? <ActivePaginatedItems itemsPerPage={15} /> : <p><strong>Nothing to show here.</strong></p>} */}
                            <ActivePaginatedItems itemsPerPage={15} />
                        </div>
                        <div className="tab-pane fade" id="ex1-tabs-2" role="tabpanel" aria-labelledby="ex1-tab-2">
                            {/* {localStorage.getItem('countExpiredJobs') > 0 ? < ExpiredPaginatedItems itemsPerPage={15} />: <p><strong>Nothing to show here.</strong></p>} */}
                            <ExpiredPaginatedItems itemsPerPage={15} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>
    );
      } else {
        window.location.replace("/");
      }
}