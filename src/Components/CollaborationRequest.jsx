import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";


export default function CollaborationRequest() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [mentorStatus, setMentorStatus] = useState("No");
    const [createMentor, setCreateMentor]  = useState({
        jobs_institution: '',
        user_mentor_current_position: '',
        user_mentor_current_company: '',
        user_mentor_key_responsibilities: '',
        user_mentor_education: '',
        user_mentor_preferred_language: '',
        user_mentor_preferred_meetup: '',
        user_mentor_rate_of_pay: '',
        user_mentor_currency: '',
        user_mentor_name_on_card: '',
        user_mentor_card_number: '',
        user_transit_number: '',
        user_institution_number: '',
        user_mentor_bio: '',
        user_mentor_services_offered: ''
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

      // Api for current user
  useEffect(() => {
    axios({
      url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userDetails.token}`
      }
    })
    .then((response) => {
        if (response?.data?.acf?.user_is_mentor === 'Yes') {
            setMentorStatus(200);
        }
    })
    .catch((err) => {
      // Handle error
    });
  }, []);

    //   Handle Change
  function handleChange(e) {
    const {name, value} = e.target
    setCreateMentor(prev => {
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
              `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`,
                {   
                    'acf' : {
                        'user_is_mentor': 'Yes',
                        'user_mentor_current_position': createMentor.user_mentor_current_position,
                        'user_mentor_current_company': createMentor.user_mentor_current_company,
                        'user_mentor_key_responsibilities': createMentor.user_mentor_key_responsibilities,
                        'user_mentor_education': createMentor.user_mentor_education,
                        'user_mentor_preferred_language': createMentor.user_mentor_preferred_language,
                        'user_mentor_preferred_meetup': createMentor.user_mentor_preferred_meetup,
                        'user_mentor_rate_of_pay': createMentor.user_mentor_rate_of_pay,
                        'user_mentor_currency': createMentor.user_mentor_currency,
                        'user_mentor_name_on_card': createMentor.user_mentor_name_on_card,
                        'user_mentor_card_number': createMentor.user_mentor_card_number,
                        'user_transit_number': createMentor.user_transit_number,
                        'user_institution_number': createMentor.user_institution_number,
                        'user_mentor_bio': createMentor.user_mentor_bio,
                        'user_mentor_services_offered': createMentor.user_mentor_services_offered,
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                    }
                }
            )
            .then((response) => {
                setMentorStatus(response.status);
            })
            .catch((error) => {
            });
    } catch (error) {
        console.error('Error submitting question:', error);
    }
}

const countries = getCountries
.slice()
.sort((a, b) => a?.name?.common?.localeCompare(b?.name?.common))
.map((country, index) => {
    for ( let key in country?.currencies) {
        return (
            <option key={index}>{key}</option>
        )
    }
})

if (userDetails != null) {
    return(
        <>
            <Navigation />
            <main className="create-job">
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
                                <input name="user_mentor_current_position" value={createMentor.user_mentor_current_position} onChange={handleChange} className='form-control form-control-lg' placeholder="Type your request briefly (150 characters max.)" aria-label='type' disabled={ mentorStatus === 200 ? true : false} required />
                                <p>*Please keep project explanations sufficiently vague to avoid scooping</p>
                            </div>    
                        </div>
                        <div className="row">
                            <div className="col-lg-12  mb-4">
                                <textarea rows="4" className="form-control form-control-lg" type="text" name="user_mentor_services_offered"  value={createMentor.user_mentor_services_offered} onChange={handleChange} aria-label='Services Offered' placeholder="Services Offered" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input className="form-control form-control-lg" type="text" name="user_mentor_name_on_card"  value={createMentor.user_mentor_name_on_card} onChange={handleChange} aria-label='Name on card' placeholder="Name on card" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input className="form-control form-control-lg" type="password" name="user_mentor_card_number"  value={createMentor.user_mentor_card_number} onChange={handleChange} aria-label='Card number' placeholder="Card number" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                        </div>
                        { mentorStatus === 200 ? 
                        <div className="alert alert-success mb-5" role="alert">
                            <p>Success! You are registered as a mentor!</p>
                        </div>
                        : ''    
                        }
                        <button className="btn btn-info btn-lg" type="submit" disabled={ mentorStatus === 200 ? true : false} >Submit</button>
                    </form>                 

                </div>
            </main>
    </>
        );
    } else {
        window.location.replace("/");
      }
};