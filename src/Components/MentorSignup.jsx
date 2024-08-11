import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import axios from "axios";


export default function MentorSignup() {
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
                                <Link to="/" className="link-dark small d-flex align-items-center"><svg className="back-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>Home</Link><span className="breadcrumb-slash">/</span><Link className="link-dark small d-flex align-items-center" to="/mentorship-opportunities">Mentorship Opportunities</Link><span className="breadcrumb-slash">/</span><span className="small d-flex align-items-center">Mentor Signup</span>
                            </div>
                        </div>
                    </div>
                    <form className="form-create-job mx-auto" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <h1><strong>Become a <i>collabb</i> mentor</strong></h1>
                            </div>
                        </div>
                        <p className="mb-3">Applying is easy! We already know about you.<br></br> We just need a bit more  information…Mentorship applications are verified:</p>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input name="user_mentor_current_position" value={createMentor.user_mentor_current_position} onChange={handleChange} className='form-control form-control-lg' placeholder="Current position" aria-label='Current position' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>    
                        </div>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input name="user_mentor_current_company" value={createMentor.user_mentor_current_company} onChange={handleChange} className='form-control form-control-lg' placeholder="Current company/institution" aria-label='Current company/institution' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12  mb-4">
                                <input className="form-control form-control-lg" type="text" name="user_mentor_preferred_language"  value={createMentor.user_mentor_preferred_language} onChange={handleChange} aria-label='Preferred language' placeholder="Preferred language" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12  mb-4">
                                <textarea rows="4" className="form-control form-control-lg" type="text" name="user_mentor_services_offered"  value={createMentor.user_mentor_services_offered} onChange={handleChange} aria-label='Services Offered' placeholder="Services Offered" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <select className="form-control form-control-lg form-select" type="text" name="user_mentor_preferred_meetup"  value={createMentor.user_mentor_preferred_meetup} onChange={handleChange} aria-label='Preferred meet-up: virtual or in-person' autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required>
                                    <option disabled value="">Preferred meet-up: virtual or in-person</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="In-person">In-person</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-6  mb-4">
                                <input className="form-control form-control-lg" type="number" name="user_mentor_rate_of_pay"  value={createMentor.user_mentor_rate_of_pay} onChange={handleChange} aria-label='Rate of pay' placeholder="Rate of pay" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                            <div className="col-lg-6  mb-4">
                                <select name="user_mentor_currency" value={createMentor.user_mentor_currency}  onChange={handleChange} className='form-control form-select form-control-lg' aria-label="Currency" autoComplete="Currency"  disabled={ mentorStatus === 200 ? true : false} required>
                                    <option disabled value="">Currency</option>
                                    {countries}
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <p className="small m-0"><strong>Briefly describe yourself, past and present postions,  and reasons for signing up:</strong></p>
                                <textarea rows="7" className="form-control form-control-lg" type="text" name="user_mentor_bio"  value={createMentor.user_mentor_bio} onChange={handleChange} aria-label='Mentor bio' placeholder="Mentor bio" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                            </div>
                        </div>
                        <p className="lead">Qualifications:</p>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <textarea rows="7" className="form-control form-control-lg" type="text" name="user_mentor_key_responsibilities"  value={createMentor.user_mentor_key_responsibilities} onChange={handleChange} aria-label='Key responsibilities in current role' placeholder="Key responsibilities in current role" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <textarea rows="7" className="form-control form-control-lg" type="text" name="user_mentor_education"  value={createMentor.user_mentor_education} onChange={handleChange} aria-label='Education' placeholder="Education: please list from most recent, including school and date of completion" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required></textarea>
                            </div>
                        </div>
                 
                        <p className="lead">Add your direct deposit information. *This is encrypted</p>
                        <div className="row">
                            <div className="col-lg-6 mb-4">
                                <input className="form-control form-control-lg" type="text" name="user_mentor_name_on_card"  value={createMentor.user_mentor_name_on_card} onChange={handleChange} aria-label='Name on card' placeholder="Name on card" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 mb-4">
                                <input className="form-control form-control-lg" type="password" name="user_mentor_card_number"  value={createMentor.user_mentor_card_number} onChange={handleChange} aria-label='Card number' placeholder="Card number" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <div className="col-lg-6 mb-4">
                                <input className="form-control form-control-lg" type="password" name="user_transit_number"  value={createMentor.user_transit_number} onChange={handleChange} aria-label='Transit number' placeholder="Transit number" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
                            </div>
                            <div className="col-lg-6 mb-4">
                                <input className="form-control form-control-lg" type="password" name="user_institution_number"  value={createMentor.user_institution_number} onChange={handleChange} aria-label='Institution number' placeholder="Institution number" autoComplete='on' disabled={ mentorStatus === 200 ? true : false} required />
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