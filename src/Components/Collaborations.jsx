import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from "react-loader-spinner";
import ReactPaginate from 'react-paginate';
import { Tab, initMDB } from "mdb-ui-kit";
import { renderedQuestion } from '../helper';
import axios from 'axios';

export default function Collaborations() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [ search, setSearch ] = useState('');
    const [ collaborations, setCollaborations ] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        initMDB({ Tab });
    }, []);

    useEffect(() => {
        axios({
          url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaborations`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userDetails.token}`
          }
        })
        .then((response) => {
            setCollaborations(response?.data);
            setLoading(false);
        })
        .catch((err) => {
          // Handle error
        });
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
    return (
      <>
        {currentItems.map((collaboration, index) => {
          
                   let posted = Date.now() - new Date(collaboration.date);
                //    let days = Math.floor(posted/(86400 * 1000));

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

                   let userProfile = "";
           
                   for (let name of users) {
                       if ( name.id == collaboration.author) {
                        userProfile = name;
                       }
                   }

                   console.log(collaboration);

            if (search.length > 0 && collaboration?.name?.toLowerCase().includes(`${search?.toLowerCase()}`) || collaboration?.title?.rendered?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.collaborations_location?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.collaborations_pay?.toLowerCase().includes(search?.toLowerCase())) {     
                return ( 
                        <div className='col-12 mb-5' key={index}>
                            <div className="card collaboration">
                                <div className="card-body">
                                {/* Top Section */}
                                    <div className="collaboration-header">
                                        <div className="d-flex flex-direction-row">
                                            <div className="d-flex" style={{marginRight: "6rem"}}>
                                                <div>
                                                    <img className="collaboration-details-name-img" src={userProfile?.['avatar_urls']?.['48']} alt={userProfile.name} loading="lazy" />
                                                </div>
                                                <div>
                                                    <p className="my-0">{userProfile?.name} | {userProfile?.acf?.["user-job-Insitution"]}</p>
                                                    <p>{years > 0 ? `${years} years` : months > 0 ? `${months} months` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-direction-row">
                                                <div className="designation-button">
                                                    <span className="small">For Authorship</span>
                                                </div>
                                                <div className="due-button">
                                                   <span className="small">Due {collaboration?.acf?.["collaborations_deadline"]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='d-flex flex-direction-row justify-content-end'>
                                            <div className="option-button"></div>
                                            <div className="option-button"></div>
                                            <div className="option-button"></div>
                                        </div>
                                    </div>
                                    {/* Middle Section */}
                                    <div>
                                        <h3 style={{fontSize: "1.4rem"}}>{collaboration?.acf?.collaborations_description}</h3>
                                        <div>{collaboration?.acf?.collaborations_features}</div>
                                    </div>
                                    {/* Bottom Section */}
                                    <div className="mt-2">3 people responded to this</div>
                                </div>
                            </div>
                        </div>
                )
            }
         }
    )}
      </>
    );
  }
  
  function ActivePaginatedmentors({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;

    
    const currentItems = collaborations.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(collaborations.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % collaborations.length;

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

    if (userDetails !== null) {
        if (loading === false) {
    return (
        <>
            <Navigation />
            <main className='collaborations'>
                <div className='container primary'>
                    <div className='get-help-details'>
                        <div className="row mb-5">
                            <div className="col-6 d-flex align-item-center">
                                <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Collaborations</span>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <div className="col-lg-12">
                                <p className="lead"><strong>Move your research along using our collaboration platform!</strong></p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-4">
                                <p><strong>Browse all collaboration opportunities</strong></p>
                            </div>
                            <div className="col-lg-4">
                                <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                    setSearch(e.target.value)
                                }} />
                            </div>
                            <div className="col-lg-4 text-end">
                                <Link to="/collaboration-request" className="btn btn-outline-info btn-lg">Request collaboration</Link>
                            </div>
                        </div>
                    </div>
                    <hr className="mb-5 mt-5"></hr>
                    <div className="mentors">
                        <ul className="nav nav-tabs mb-5" id="ex1" role="tablist">
                            <li className="nav-item" role="presentation">
                                <a data-mdb-tab-init className="nav-link active" id="ex1-tab-1" href="#ex1-tabs-1" role="tab" aria-controls="ex1-tabs-1" aria-selected="true" >Collaborations</a>
                            </li>
                            <li className="nav-item" role="presentation">
                                <a data-mdb-tab-init className="nav-link" id="ex1-tab-2" href="#ex1-tabs-2" role="tab" aria-controls="ex1-tabs-2" aria-selected="false" >Archived</a>
                            </li>
                        </ul>
                        <div className="tab-content" id="ex1-content">
                            <div className="tab-pane fade show active" id="ex1-tabs-1" role="tabpanel" aria-labelledby="ex1-tab-1">
                                {/* {localStorage.getItem('countActiveJobs') > 0 ? <ActivePaginatedItems itemsPerPage={15} /> : <p><strong>Nothing to show here.</strong></p>} */}
                                <ActivePaginatedmentors itemsPerPage={15} />
                            </div>
                            <div className="tab-pane fade" id="ex1-tabs-2" role="tabpanel" aria-labelledby="ex1-tab-2">
                                {/* {localStorage.getItem('countExpiredJobs') > 0 ? < ExpiredPaginatedItems itemsPerPage={15} />: <p><strong>Nothing to show here.</strong></p>} */}
                                {/* <ActivePaginatedmentors itemsPerPage={15} /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
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
        window.location.replace('/')
    }
}

