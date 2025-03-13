import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import axios from "axios";
import { Tab, initMDB } from "mdb-ui-kit";
import { renderedQuestion } from "../helper"
import ReactPaginate from 'react-paginate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import UserComment from "../Images/user-comment.svg";
import { submitReport } from '../helper';


export default function Jobs() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
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

    useEffect(() => {
        localStorage.setItem('countActiveJobs', 0);
        localStorage.setItem('countExpiredJobs', 0);
    }, []);

        // Return users
        useEffect(() => {
            axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`, 
                {
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                        }
                }
            )
                .then((response) => {
                    setUsers(response.data);
                }).catch((err) => {
                    console.error(err);
                });
            }, []);

// Start paginated active jobs

function ActiveItem({ currentItems }) {

    const [optionDisplay, setOptionDisplay] = useState({});
    let [buttonClick, setButtonClick] = useState(0);

    const handleToggleOptions = (index) => {
        setOptionDisplay(prevState => ({
            ...prevState,
            [index]: prevState[index] === 'show' ? 'hide' : 'show'
        }));
    };

    const handleHideCollaboration = (index) => {
        setButtonClick(prev => prev + 1); // Trigger a re-render by updating state
    };

    return (
      <>
        {currentItems.map((job, index) => {
            console.log(job)

            let posted = Date.now() - new Date(job.date);

           // Calculate total days
            let totalDays = Math.floor(posted / (86400 * 1000));

            // Calculate years
            let years = Math.floor(totalDays / 365);

            // Calculate remaining days after extracting years
            let remainingDaysAfterYears = totalDays % 365;

            // Calculate months
            let months = Math.floor(remainingDaysAfterYears / 30);

            // Calculate remaining days after extracting months
            let days = remainingDaysAfterYears % 30;

        let deadlineString = job.acf.jobs_application_deadline;
        let find = '-';
        let re = new RegExp(find, 'g');
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

            if (search.length > 0 && job.title.rendered.toLowerCase().includes(search.toLowerCase()) || job.acf.jobs_institution.toLowerCase().includes(search.toLowerCase())) {
                let seeIfchecked = job?.acf?.jobs_applied_users?.split(' ');
                let userProfile = "";
                let showJob =  localStorage.getItem(`show_job${index}`);
                for (let name of users) {
                    if ( name.id == job.author) {
                     userProfile = name;
                    }
                 }
                return (
                    <div className={`mb-4 col-lg-6 ${showJob}`} key={index}>
                    <div className="card collaboration">
                        <div className="card-body">
                        {/* Top Section */}
                            <div className="collaboration-header" style={{marginBottom: "1rem",}}>
                                <div className="d-flex flex-direction-row">
                                    <div className="d-flex" style={{marginRight: "6rem"}}>
                                        <div class="d-flex flex-row">
                                        <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job?.title?.rendered, search) : job?.title?.rendered}} /></strong>
                                            <div className="d-flex flex-row align-items-center" >
                                                <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="options-container">
                                    <div className='d-flex flex-direction-row justify-content-end options' onClick={() => handleToggleOptions(index)}>
                                        <div className="option-button"></div>
                                        <div className="option-button"></div>
                                        <div className="option-button"></div>
                                    </div>
                                    <div className={`option-items ${optionDisplay[index]}`}>
                                        <div className="option-item" onClick={() => {
                                            localStorage.setItem(`show_job${index}`, 'hide')
                                            handleHideCollaboration(index)
                                            }}>Hide</div>
                                        <div className="option-item" onClick={()=>{
                                            submitReport(job, userDetails);
                                        }}>Report</div>
                                    </div>
                                </div>
                            </div>
                            {/* Middle Section */}
                            <div style={{marginBottom: "1.8rem"}}>
                                <strong><div style={{fontSize: "1.4rem", marginBottom: "1rem"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job?.acf?.jobs_institution, search) : job?.acf?.jobs_institution}} /></strong>
                                <p class="p-0 m-0">{job?.acf?.["jobs_city"]} | {job?.acf?.["jobs_country"]}</p>
                                <div className="row d-flex align-items-center">
                                    <div className="col-6">
                                        <div className="d-flex flex-direction-row my-3">
                                            <div className="designation-button">
                                                <span className="small">{job?.acf?.["jobs_job_type"]}</span>
                                            </div>
                                            <div className="due-button">
                                                <span className="small">Deadline {job?.acf?.["jobs_application_deadline"]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 d-flex justify-content-end">
                                        {seeIfchecked.includes(userDetails?.id?.toString()) ?
                                        (<div className="checked-mark">
                                        <FontAwesomeIcon icon={faSquareCheck} /> <span class="small grey">Applied</span>
                                        </div>) : ''}
                                    </div>
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: job?.acf?.jobs_description?.length > 250 ? job?.acf?.jobs_description?.slice(0, 250)+"..." : job?.acf?.jobs_description}} />
                            </div>
                            {/* Bottom Section */}
                            <div className="row d-flex justify-content-between flex-row">                                        
        
                                <div className="col-auto ml-auto">
                                    <a href={"/job/"+job["id"]} className="btn btn-primary collab-btn">Explore Job</a>
                                </div>
                           
                            </div>
                        </div>
                    </div>
                </div>
                )
            }
            if (search.length == 0) {
                let seeIfchecked = job?.acf?.jobs_applied_users?.split(' ');
                let userProfile = "";
                let showJob =  localStorage.getItem(`show_job${index}`);
                for (let name of users) {
                    if ( name.id == job.author) {
                     userProfile = name;
                    }
                }
                return (
            <div className={`mb-4 col-lg-6 ${showJob}`} key={index}>
            <div className="card collaboration">
                <div className="card-body">
                {/* Top Section */}
                    <div className="collaboration-header" style={{marginBottom: "1rem",}}>
                        <div className="d-flex flex-direction-row">
                            <div className="d-flex" style={{marginRight: "6rem"}}>
                                <div class="d-flex flex-row">
                                <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job.title.rendered, search) : job.title.rendered}} /></strong>
                                    <div className="d-flex flex-row align-items-center" >
                                        <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="options-container">
                            <div className='d-flex flex-direction-row justify-content-end options' onClick={() => handleToggleOptions(index)}>
                                <div className="option-button"></div>
                                <div className="option-button"></div>
                                <div className="option-button"></div>
                            </div>
                            <div className={`option-items ${optionDisplay[index]}`}>
                                <div className="option-item" onClick={() => {
                                    localStorage.setItem(`show_job${index}`, 'hide')
                                    handleHideCollaboration(index)
                                    }}>Hide</div>
                                <div className="option-item" onClick={()=>{
                                    submitReport(job, userDetails);
                                }}>Report</div>
                            </div>
                        </div>
                    </div>
                    {/* Middle Section */}
                    <div style={{marginBottom: "1.8rem"}}>
                        <h3 style={{fontSize: "1.4rem", marginBottom: "1rem"}}>{search.length > 0 ? renderedQuestion(job?.acf?.jobs_institution, search) : job?.acf?.jobs_institution}</h3>
                        <p class="p-0 m-0">{job?.acf?.["jobs_city"]} | {job?.acf?.["jobs_country"]}</p>
                        <div className="row d-flex align-items-center">
                            <div className="col-6">
                                <div className="d-flex flex-direction-row my-3">
                                    <div className="designation-button">
                                        <span className="small">{job?.acf?.["jobs_job_type"]}</span>
                                    </div>
                                    <div className="due-button">
                                        <span className="small">Deadline {job?.acf?.["jobs_application_deadline"]}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 d-flex justify-content-end">
                                {seeIfchecked.includes(userDetails?.id?.toString()) ?
                                (<div className="checked-mark">
                                <FontAwesomeIcon icon={faSquareCheck} /> <span class="small grey">Applied</span>
                                </div>) : ''}
                            </div>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: job?.acf?.jobs_description?.length > 250 ? job?.acf?.jobs_description?.slice(0, 250)+"..." : job?.acf?.jobs_description}} />
                    </div>
                    {/* Bottom Section */}
                    <div className="row d-flex justify-content-between flex-row">                                        

                        <div className="col-auto ml-auto">
                            <a href={"/job/"+job["id"]} className="btn btn-primary collab-btn">Explore Job</a>
                        </div>
                   
                    </div>
                </div>
            </div>
        </div>
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

    
    const currentItems = jobs.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(jobs.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % jobs.length;

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
    const [optionDisplay, setOptionDisplay] = useState({});
    let [buttonClick, setButtonClick] = useState(0);

    const handleToggleOptions = (index) => {
        setOptionDisplay(prevState => ({
            ...prevState,
            [index]: prevState[index] === 'show' ? 'hide' : 'show'
        }));
    };

    const handleHideCollaboration = (index) => {
        setButtonClick(prev => prev + 1); // Trigger a re-render by updating state
    };
    return (
      <>
        {currentItems.map((job, index) => {
        let posted = Date.now() - new Date(job.date);

        // Calculate total days
         let totalDays = Math.floor(posted / (86400 * 1000));

         // Calculate years
         let years = Math.floor(totalDays / 365);

         // Calculate remaining days after extracting years
         let remainingDaysAfterYears = totalDays % 365;

         // Calculate months
         let months = Math.floor(remainingDaysAfterYears / 30);

         // Calculate remaining days after extracting months
         let days = remainingDaysAfterYears % 30;

        let deadlineString = job.acf.jobs_application_deadline;
        let find = '-';
        let re = new RegExp(find, 'g');
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

            if (search.length > 0 && job.title.rendered.toLowerCase().includes(search.toLowerCase()) || job.acf.jobs_institution.toLowerCase().includes(search.toLowerCase())) {
                let seeIfchecked = job?.acf?.jobs_applied_users?.split(' ');
                let showJob =  localStorage.getItem(`show_job${index}`);
                return (
                    <div className={`mb-4 col-lg-6 ${showJob}`} key={index}>
                    <div className="card collaboration">
                        <div className="card-body">
                        {/* Top Section */}
                            <div className="collaboration-header" style={{marginBottom: "1rem",}}>
                                <div className="d-flex flex-direction-row">
                                    <div className="d-flex" style={{marginRight: "6rem"}}>
                                        <div class="d-flex flex-row">
                                        <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job?.title?.rendered, search) : job?.title?.rendered}} /></strong>
                                            <div className="d-flex flex-row align-items-center" >
                                                <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="options-container">
                                    <div className='d-flex flex-direction-row justify-content-end options' onClick={() => handleToggleOptions(index)}>
                                        <div className="option-button"></div>
                                        <div className="option-button"></div>
                                        <div className="option-button"></div>
                                    </div>
                                    <div className={`option-items ${optionDisplay[index]}`}>
                                        <div className="option-item" onClick={() => {
                                            localStorage.setItem(`show_job${index}`, 'hide')
                                            handleHideCollaboration(index)
                                            }}>Hide</div>
                                        <div className="option-item" onClick={()=>{
                                            submitReport(job, userDetails);
                                        }}>Report</div>
                                    </div>
                                </div>
                            </div>
                            {/* Middle Section */}
                            <div style={{marginBottom: "1.8rem"}}>
                                <strong><div style={{fontSize: "1.4rem", marginBottom: "1rem"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job?.acf?.jobs_institution, search) : job?.acf?.jobs_institution}} /></strong>
                                <p class="p-0 m-0">{job?.acf?.["jobs_city"]} | {job?.acf?.["jobs_country"]}</p>
                                <div className="row d-flex align-items-center">
                                    <div className="col-6">
                                        <div className="d-flex flex-direction-row my-3">
                                            <div className="designation-button">
                                                <span className="small">{job?.acf?.["jobs_job_type"]}</span>
                                            </div>
                                            <div className="due-button">
                                                <span className="small">Deadline {job?.acf?.["jobs_application_deadline"]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 d-flex justify-content-end">
                                        {seeIfchecked.includes(userDetails?.id?.toString()) ?
                                        (<div className="checked-mark">
                                        <FontAwesomeIcon icon={faSquareCheck} /> <span class="small grey">Applied</span>
                                        </div>) : ''}
                                    </div>
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: job?.acf?.jobs_description?.length > 250 ? job?.acf?.jobs_description?.slice(0, 250)+"..." : job?.acf?.jobs_description}} />
                            </div>
                            {/* Bottom Section */}
                            <div className="row d-flex justify-content-between flex-row">                                        
        
                                <div className="col-auto ml-auto">
                                    <a href={"/job/"+job["id"]} className="btn btn-primary collab-btn">Explore Job</a>
                                </div>
                           
                            </div>
                        </div>
                    </div>
                </div>
                )
            }
            if (search.length == 0) {
                let seeIfchecked = job?.acf?.jobs_applied_users?.split(' ');
                let showJob =  localStorage.getItem(`show_job${index}`);
                return (
                    <div className={`mb-4 col-lg-6 ${showJob}`} key={index}>
                    <div className="card collaboration">
                        <div className="card-body">
                        {/* Top Section */}
                            <div className="collaboration-header" style={{marginBottom: "1rem",}}>
                                <div className="d-flex flex-direction-row">
                                    <div className="d-flex" style={{marginRight: "6rem"}}>
                                        <div class="d-flex flex-row">
                                        <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job?.title?.rendered, search) : job?.title?.rendered}} /></strong>
                                            <div className="d-flex flex-row align-items-center" >
                                                <span className="option-button" style={{marginRight: ".5rem"}}></span><p style={{marginBottom: 0}}>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="options-container">
                                    <div className='d-flex flex-direction-row justify-content-end options' onClick={() => handleToggleOptions(index)}>
                                        <div className="option-button"></div>
                                        <div className="option-button"></div>
                                        <div className="option-button"></div>
                                    </div>
                                    <div className={`option-items ${optionDisplay[index]}`}>
                                        <div className="option-item" onClick={() => {
                                            localStorage.setItem(`show_job${index}`, 'hide')
                                            handleHideCollaboration(index)
                                            }}>Hide</div>
                                        <div className="option-item" onClick={()=>{
                                            submitReport(job, userDetails);
                                        }}>Report</div>
                                    </div>
                                </div>
                            </div>
                            {/* Middle Section */}
                            <div style={{marginBottom: "1.8rem"}}>
                                <strong><div style={{fontSize: "1.4rem", marginBottom: "1rem"}} dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(job?.acf?.jobs_institution, search) : job?.acf?.jobs_institution}} /></strong>
                                <p class="p-0 m-0">{job?.acf?.["jobs_city"]} | {job?.acf?.["jobs_country"]}</p>
                                <div className="row d-flex align-items-center">
                                    <div className="col-6">
                                        <div className="d-flex flex-direction-row my-3">
                                            <div className="designation-button">
                                                <span className="small">{job?.acf?.["jobs_job_type"]}</span>
                                            </div>
                                            <div className="due-button">
                                                <span className="small">Deadline {job?.acf?.["jobs_application_deadline"]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 d-flex justify-content-end">
                                        {seeIfchecked.includes(userDetails?.id?.toString()) ?
                                        (<div className="checked-mark">
                                        <FontAwesomeIcon icon={faSquareCheck} /> <span class="small grey">Applied</span>
                                        </div>) : ''}
                                    </div>
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: job?.acf?.jobs_description?.length > 250 ? job?.acf?.jobs_description?.slice(0, 250)+"..." : job?.acf?.jobs_description}} />
                            </div>
                            {/* Bottom Section */}
                            <div className="row d-flex justify-content-between flex-row">                                        
        
                                <div className="col-auto ml-auto">
                                    <a href={"/job/"+job["id"]} className="btn btn-primary collab-btn">Explore Job</a>
                                </div>
                           
                            </div>
                        </div>
                    </div>
                </div>
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
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">Jobs</span>
                        </div>
                    </div>
                    <div className="row mb-5">
                            <div className="col-lg-12">
                                <p className="lead"><strong>Find jobs that match your skill set!</strong></p>
                            </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-4">
                            <p><strong>Browse all job opportunities</strong></p>
                        </div>
                        <div className="col-lg-4">
                            <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                setSearch(e.target.value)
                             }} />
                        </div>
                        <div className="col-lg-4 text-end">
                            <Link to="/create-job" className="btn btn-outline-info btn-lg">Create a Job Posting</Link>
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
                            <div className="row">
                                <ActivePaginatedItems itemsPerPage={15} />
                            </div>
                        </div>
                        <div className="tab-pane fade" id="ex1-tabs-2" role="tabpanel" aria-labelledby="ex1-tab-2">
                            <div className="row">
                                <ExpiredPaginatedItems itemsPerPage={15} />
                            </div>
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