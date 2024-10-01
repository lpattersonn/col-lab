import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TailSpin } from "react-loader-spinner";
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";



export default function Request() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const { param1 } = useParams();
    const [ requestDetails, setRequestDetails ] = useState({}); 
    const [ requestorDetails, setRequestorDetails ] = useState([]); 
    const [loading, setLoading] = useState(true);
    const Naviagte = useNavigate()

    // Get menotr information
    useEffect(() => {
      axios({
        url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/collaborations/${param1}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${userDetails.token}`
          }
      })
      .then((response) => {
        console.log(response);
        setRequestDetails(response.data);
        setLoading(false);
      })
      .catch(err => console.log(err))

      
    }, []);

     // Get menotr information
     useEffect(() => {
        axios({
          url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${requestDetails?.author}`,
          method: 'GET',
          headers: {
              Authorization: `Bearer ${userDetails.token}`
            }
        })
        .then((response) => {
            setRequestorDetails(response.data);
         
        })
        .catch(err => console.log(err))
      }, []);

    // Get all mentor chats
    //     useEffect(() => {
    //         axios({
    //             method: 'GET',
    //             url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-chats`
    //         },
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${userDetails.token}`
    //             }
    //         }
    //     ).then((res) => {
    //         setMentorChats(res.data)
    //     }).catch(err => console.log(err))
    // }, [])

    let chatID = undefined;

    // mentorChats.map((chat) => {
    //     if(userDetails?.id === chat?.acf?.mentee_id && Number(param1) === chat?.acf?.mentors_id) {
    //         chatID = chat?.id;
    //         return;
    //     }
    // })

    // Handle Check
    // function handelCheckedChange(e) {
    //     let checked = e.target.checked;
    //     if (checked === true) {
    //         axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/jobs/${param1}`,{acf: {
    //             'jobs_applied_users': `${requestDetails?.acf?.jobs_applied_users} ${JSON.stringify(userDetails.id)} `
    //           }
    //         },
    //         {
    //                 headers: {
    //                 Authorization: `Bearer ${userDetails.token}`
    //             }
    //         } 
    //           )
    //           .then(res => {
    //             setrequestDetails(res.data)})
    //           .catch(err => {console.log(err)})
    //     }
    // }

//   function DateToReadable(param) {
//     const dateString = param;
//     const year = dateString?.substring(0, 4);
//     const month = dateString?.substring(4, 6);
//     const day = dateString?.substring(6, 8);

//     const date = new Date(`${year}-${month}-${day}`);
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     const formattedDate = date.toLocaleDateString('en-US', options);
//     return formattedDate
//   }
 
//   const createMentorChat = async (e) => {
//     try {
//         const createChat = await axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/mentor-chats`,
//             {
//                 author: userDetails.id,
//                 title: `Mentor: ${ requestDetails?.name}, Mentee: ${userDetails?.displayName}`,
//                 content: `Mentorship session between ${requestDetails.name} and ${userDetails.displayName}`,
//                 excerpt: `Mentorship session between ${requestDetails.name} and ${userDetails.displayName}`,
//                 status: 'publish',
//                 acf: {
//                     'mentors_id': `${param1}`,
//                     'mentee_id': `${userDetails.id}`,
//                     'mentors_image': `${requestDetails?.avatar_urls?.['48']}`,
//                     'mentee_id': `${requestDetails?.avatar_urls?.['48']}`,
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${userDetails.token}`
//                 }
//             }
//         ).then((response) => {
//                 Naviagte(`/mentor-chat/${response?.data?.id}`);
//             }
//         ).catch((err) => {})

//     } catch (err) {

//     }
//   };

  if (userDetails != null) {
    if (loading === false) {
    return(
        <>
            <Navigation />
            <main className="create-job">
                <div className="container primary" >
                    <div className="page-filter">
                        <div className="row mb-5">
                            <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">></span><Link to="/collaborations" className="link-dark small d-flex align-items-center">Collaborations</Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">{requestDetails?.acf?.collaborations_description.substring(0, 30)}{requestDetails?.acf?.collaborations_description.length > 30 && '...'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-create-job mx-auto" >
                        <div className="row mb-4 d-flex align-items-center">
                            <div className="col-auto mb-4">
                                <img className="mentor-details-img" src={requestorDetails?.avatar_urls?.['48']} alt={requestorDetails?.name} />
                            </div>
                            <div className="col-auto mb-4">
                                <h1>{requestorDetails?.name}</h1>
                                <p className="m-0">{requestorDetails?.acf?.['user_mentor_current_position']} at {requestorDetails?.acf?.['user_mentor_current_company']}</p>
                                <p className="m-0">{requestorDetails?.acf?.['user-city']}{requestorDetails?.acf?.['user-country-of-residence']?.length > 0 ? ',' : ''} {requestDetails?.acf?.['user-country-of-residence']}</p>
                            </div>
                            <hr></hr>
                        </div>
                        <div className="row mb-4">
                            <div className="col-lg-12 mb-4">
                                <span><strong>About me:</strong> {requestDetails?.acf?.['user_mentor_bio']}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Key responsibilities:</strong><br></br> {requestDetails?.acf?.['user_mentor_key_responsibilities']}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Education:</strong> {requestDetails?.acf?.user_mentor_education}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Preferred language(s):</strong> {requestDetails?.acf?.user_mentor_preferred_language}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Services offered:</strong> <br></br>{requestDetails?.acf?.['user_mentor_services_offered']}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Preferred meet-up:</strong> {requestDetails?.acf?.user_mentor_preferred_meetup}</span>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <span><strong>Rate of pay:</strong> {requestDetails?.acf?.['user_mentor_currency']} {requestDetails?.acf?.['user_mentor_rate_of_pay']}/hour</span>                            
                            </div>                      
                        </div>    
                        <div className="row mb-4 d-flex align-items-center">
                            <div className="col-auto">
                                <button className={`btn btn-info btn-lg ${chatID === undefined ? 'display-block' : 'display-none'}`} onClick={''}>Sign up with mentor</button>
                                <Link className={`btn btn-info btn-lg ${chatID === undefined ? 'display-none' : 'display-block'}`} to={`/mentor-chat/${chatID}`} >Return to chat</Link>
                            </div> 
                            <div className="col-auto">
                                <Link to={"/collaborations"}><button className="btn btn-danger btn-lg"><strong>Back</strong></button></Link>
                            </div> 
                        </div>          
                    </div>                 
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
        window.location.replace("/");
      }
};