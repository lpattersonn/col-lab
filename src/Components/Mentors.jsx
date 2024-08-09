import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import ReactPaginate from 'react-paginate';
import { renderedQuestion } from '../helper';
import axios from 'axios';

export default function Mentors() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [ search, setSearch ] = useState('');
    const [ mentorsList, setMentorsList ] = useState([]);

    useEffect(() => {
        axios({
          url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userDetails.token}`
          }
        })
        .then((response) => {
            const list = response.data.filter(user => user?.acf?.user_is_mentor === 'Yes' && user.id !== userDetails.id);
            setMentorsList(list);
            console.log(list)
        })
        .catch((err) => {
          // Handle error
        });
      }, []);
    
    // Start paginated active jobs

function ActiveItem({ currentItems }) {
    return (
      <>
        {currentItems.map((mentor, index) => {
        if (mentor?.acf?.user_is_mentor === 'Yes' && mentor.id !== userDetails.id) {
            if (search.length > 0 && mentor?.name.toLowerCase().includes(`${search.toLowerCase()}`) || mentor?.acf['user_mentor_services_offered'].toLowerCase().includes(search.toLowerCase()) || mentor?.acf['user_mentor_current_position'].toLowerCase().includes(search.toLowerCase()) || mentor?.acf['user_mentor_current_company'].toLowerCase().includes(search.toLowerCase())) {     
                return ( 
                    <div className='col-lg-4 mb-5' key={index}>
                        <Link to={`/mentor/${mentor.id}`}>
                            <div className='card mentor'>
                                <div className='card-body'>
                                    <div className="questions-details-name">
                                    <img className="questions-details-name-img" src={mentor?.avatar_urls['48']} loading='lazy' />
                                    <div className="questions-details-name-info">
                                        <strong><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(mentor.name, search) : mentor.name } } /></strong>
                                        <div className="questions-details-posted">
                                        <span className='small'>{mentor?.acf['user-city']}{mentor?.acf['user-country-of-residence'].length > 0 ? ',' : ''} {mentor?.acf['user-country-of-residence']}</span>
                                        </div>
                                    </div>
                                    </div>
                                    <hr></hr>
                                    <div className='mentor-main-details'>
                                        <div className='mb-3'><FontAwesomeIcon icon={faSuitcase} /> <strong><div className='small inline' dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(mentor?.acf['user_mentor_current_position'], search) : mentor?.acf['user_mentor_current_position'] } } /> at <div className='small inline' dangerouslySetInnerHTML={{ __html: search?.length > 0 ? renderedQuestion(mentor?.acf['user_mentor_current_company'], search) : mentor?.acf['user_mentor_current_company'] } } /></strong></div>
                                        <p className='small'><FontAwesomeIcon icon={faPen} /> {mentor?.acf['user_mentor_bio'].slice(0, 200)}{mentor?.acf['user_mentor_bio'].length > 200 ? '...' : ''}</p>
                                        <div className='mb-3'><strong>Offering:</strong> <div className='small inline' dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(mentor?.acf['user_mentor_services_offered']?.slice(0, 200), search) : mentor?.acf['user_mentor_services_offered']?.slice(0, 200) } } />{mentor?.acf['user_mentor_services_offered'].length > 100 ? '...' : ''}</div>
                                        <p className='small'><FontAwesomeIcon icon={faCoins} /> {mentor?.acf['user_mentor_currency']} {mentor?.acf['user_mentor_rate_of_pay']}/hour</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            }
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

    
    const currentItems = mentorsList.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(mentorsList.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % mentorsList.length;

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
    return (
        <>
            <Navigation />
            <main className='mentors'>
                <div className='container primary'>
                    <div className='get-help-details'>
                        <div className="row mb-5">
                            <div className="col-6 d-flex align-item-center">
                                <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Mentorship Opportunities</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-4">
                                <p><strong>Meet our <i>collabb</i> Mentors</strong></p>
                            </div>
                            <div className="col-lg-4">
                                <input type="search" name="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                    setSearch(e.target.value)
                                }} />
                            </div>
                            <div className="col-lg-4 text-end">
                                <Link to="/mentor-signup" className="btn btn-outline-info btn-lg">Apply To Become a Mentor</Link>
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
        window.location.replace('/')
    }
}