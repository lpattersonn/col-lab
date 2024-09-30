import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from "react-loader-spinner";
import defaultImage from "../Images/5402435_account_profile_user_avatar_man_icon.svg"
import ReactPaginate from 'react-paginate';
import { renderedQuestion } from '../helper';
import axios from 'axios';

export default function Collaborations() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [ search, setSearch ] = useState('');
    const [ collaborations, setCollaborations ] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

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
            console.log(response);
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
                   let days = Math.floor(posted/(86400 * 1000));

                   let userProfile = "";
           
                   for (let name of users) {
                       if ( name.id == collaboration.author) {
                        userProfile = name;
                        console.log(userProfile);
                       }
                   }

                   console.log(userProfile)


            if (search.length > 0 && collaboration?.name?.toLowerCase().includes(`${search?.toLowerCase()}`) || collaboration?.title?.rendered?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.collaborations_location?.toLowerCase().includes(search?.toLowerCase()) || collaboration?.acf?.collaborations_pay?.toLowerCase().includes(search?.toLowerCase())) {     
                return ( 
                    <div className='col-12 mb-5' key={index}>
                        <div className="card get-help-item">
                            <div className="card-body collaboration">
                                <div className="row align-items-start">
                                    <div className='col-lg-2 d-flex align-items-center'>
                                        <div className='collaboration-image'>
                                            <div className="collaboration-details">
                                                <div className="collaboration-details-name">
                                                    <img className="collaboration-details-name-img" src={userProfile?.['avatar_urls']?.['48']} alt={userProfile.name} loading="lazy" />
                                                    <div className="collaboration-details-name-info">
                                                        <p><strong>{userProfile.name}</strong></p>
                                                        <div className="collaboration-details-posted">
                                                            {userProfile?.acf?.['user-job-Insitution'] ?
                                                            (<div>
                                                                <p>{userProfile?.acf?.['user-job-Insitution']}</p>
                                                            </div>) : ("")
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-lg-3 d-flex align-items-center'>
                                        <div className='get-help'>
                                            <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(collaboration?.title?.rendered, search) : collaboration?.title?.rendered}} /></strong>
                                        </div>
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-end collaboration-pay'>
                                        <strong><i>{collaboration?.acf?.collaborations_pay}</i></strong>
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center'>
                                    {collaboration?.acf?.collaborations_location}
                                    </div>
                                    <div className='col-lg-1 d-flex align-items-center justify-content-end'>
                                        {days == 0 ? "Posted today" : `${days}d ago`}
                                    </div>
                                    <div className='col-lg-2 d-flex align-items-center justify-content-end'>
                                        0 responses
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* </Link> */}
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
                                <p class="lead"><strong>Move your research along using our collaboration platform!</strong></p>
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
                        <div className='row'>
                            <ActivePaginatedmentors itemsPerPage={21} />
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