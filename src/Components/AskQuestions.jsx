import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import defaultImage from '../Images/5402435_account_profile_user_avatar_man_icon.svg';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { renderedQuestion } from '../helper';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import { scienceBrnaches } from '../helper';
import { TailSpin } from "react-loader-spinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserComment from "../Images/user-comment.svg";
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { submitReport } from '../helper';


export default function AskQuestions() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    const [question, setQuestion] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [modalClass, setModalClass] = useState('hide-modal');
    const [askQuestionStatus, setAskQuestionStatus] = useState('not published');
    const [file, setFile] = useState(null);
    const [ askQuestionContent, setAskQuestionContent ] = useState('');
    const [usersAccountDetails, setUsersAccountDetails] = useState({});
    const [questionSubject, setQuestionSubject] = useState('General');
    const [loading, setLoading] = useState(true);
    const [askQuestionApi, setAskQuestionApi] = useState({
        title: '',
        content: '',
        question_subject_area: '', 
        question_image: '',
    });

    // Get questions on page load
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions?per_page=100`)
            .then((response) => {
                setQuestion(response.data);
                setLoading(false);
            }).catch((err) => {
                console.error(err);
            });
    }, []);

    // Get questions when user submits question
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions?per_page=100`)
            .then((response) => {
                setLoading(false);
                setQuestion(response.data);
            }).catch((err) => {
                console.error(err);
            });
    }, [askQuestionApi, search]);

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

      // Api for current user
  useEffect(() => {
    let userDetails = JSON.parse(localStorage.getItem("userDetails"));
    axios({
      url: `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails?.id}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userDetails.token}`
      }
    })
    .then((response) => {
      localStorage.setItem('userPoints', JSON.stringify(response.data['acf']['user-points']));
      setUsersAccountDetails(response.data);
    })
    .catch((err) => {
      // Handle error
    });
  }, []);

    // Handle file change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    // Handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAskQuestionApi(prevState => ({
            ...prevState,
            [name]: value,
        }));
    }

    // TinyMC Handle Change
    function handleChangeContent(e) {
        setAskQuestionContent(e.target.getContent());
    }

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Upload image if file exists
            let imageUrl = '';
            if (file && userDetails) {
                const formData = new FormData();
                formData.append('file', file);
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/media`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${userDetails.token}`
                        }
                    }
                );
                imageUrl = response.data.source_url;
            }

            // Create comment
            const commentResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions`,
                {
                    author: userDetails.id,
                    title: askQuestionApi.title,
                    content: askQuestionContent,
                    excerpt: askQuestionContent,
                    status: 'publish',
                    acf: {
                        'question_image': imageUrl,
                        'question_subject_area': askQuestionApi.question_subject_area,
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${userDetails.token}`
                    }
                }
            ).then((response) => {
            }).catch((err) => {})
            setAskQuestionStatus('published');
        } catch (error) {
            console.error('Error submitting question:', error);
        }
    }

    const optionsArray = 
        scienceBrnaches().map((options, index) => {
            return (<option key={index}>{options}</option>);
        });

    // Start pagination
    function Items({ currentItems }) {
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
        {currentItems &&
            currentItems.map((question, index) => {
                let user = {};
                let userName = "";
                let userProfileImg = "";

                let posted = Date.now() - new Date(question.date);
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
        
                for (let name of users) {
                    if ( name.id == question.author) {
                    user = name;
                    userName = name.name;
                    userProfileImg = name['avatar_urls']['48'];
                    }
                }
        
                function commentCount() {
                    return axios.get(`${question._links.replies['0'].href}`)
                    .then((response) => {
                    numberOfComments[0].count = response.data.length;
                    localStorage.setItem(`comment_count${index}`, numberOfComments[0].count)
                    }).catch((error) => {})
                }
        
                // Parsing comments
                let count = localStorage.getItem(`comment_count${index}`);
                // Ensure that numberOfComments is initialized as an object
                let numberOfComments = [{ count: parseInt(count) }]; // Parse string to integer
                // Then you can update the count property
                numberOfComments[0].count = parseInt(count); // Parse string to integer
        
                commentCount();

                let showOpportunity =  localStorage.getItem(`show_question${index}`);
        
                if (search.length > 0 && question.title.rendered.toLowerCase().includes(`${search.toLowerCase()}`) || userName.toLowerCase().includes(search.toLowerCase())) {      
                    if (questionSubject === 'Specific' && usersAccountDetails?.acf?.user_feild == question?.acf?.question_subject_area) {          
                        return (                    
                            <div className={`col-12 mb-5 ${showOpportunity}`} key={index}>
                            <div className="card collaboration">
                                <div className="card-body">
                                {/* Top Section */}
                                    <div className="collaboration-header">
                                        <div className="d-flex flex-direction-row">
                                            <div className="d-flex" style={{marginRight: "6rem"}}>
                                                <div>
                                                    <img className="collaboration-details-name-img" src={userProfileImg} alt={userName} loading="lazy" />
                                                </div>
                                                <div>
                                                    <p className="my-0"><strong>{userName}</strong> | {user?.acf?.["user-job-Insitution"]}</p>
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
                                            <div className={`option-items ${optionDisplay[index]}`} >
                                                <div className="option-item" onClick={() => {
                                                localStorage.setItem(`show_question${index}`, 'hide')
                                                handleHideCollaboration(index)
                                                }}>Hide</div>
                                                <div className="option-item" onClick={()=>{
                                                    submitReport(question, userDetails);
                                                }}>Report</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Middle Section */}
                                    <div style={{marginBottom: "1.8rem"}}>
                                        <h3 style={{fontSize: "1.4rem", marginBottom: "1.5rem"}}><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question.title.rendered, search) : question.title.rendered } } /></h3>
                                        <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question?.excerpt?.rendered?.split(0, 340), search) : question?.excerpt?.rendered?.split(0, 340) } } />
                                    </div>
                                    {/* Bottom Section */}
                                    <div className="row d-flex flex-row">
                                        <img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} /> 
                                        <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{numberOfComments[0].count} people responded to this</div>
                                        <div className="col-auto">
                                        <Link to={{ pathname: `/question/${question.id}/`}} className="btn btn-primary collab-btn">View</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )
                    }
                    if (questionSubject === 'General') {          
                        return (
                            <div className={`col-12 mb-5 ${showOpportunity}`} key={index}>
                                <div className="card collaboration">
                                    <div className="card-body">
                                    {/* Top Section */}
                                        <div className="collaboration-header">
                                            <div className="d-flex flex-direction-row">
                                                <div className="d-flex" style={{marginRight: "6rem"}}>
                                                    <div>
                                                        <img className="collaboration-details-name-img" src={userProfileImg} alt={userName} loading="lazy" />
                                                    </div>
                                                    <div>
                                                        <p className="my-0"><strong>{userName}</strong> | {user?.acf?.["user-job-Insitution"]}</p>
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
                                                </div>;   
                                                <div className={`option-items ${optionDisplay[index]}`} >                                                     <div className="option-item" onClick={() => {
                                                    localStorage.setItem(`show_question${index}`, 'hide')
                                                    handleHideCollaboration(index)
                                                    }}>Hide</div>
                                                    <div className="option-item" onClick={()=>{
                                                    submitReport(question, userDetails);
                                                }}>Report</div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Middle Section */}
                                        <div style={{marginBottom: "1.8rem"}}>
                                            <h3 style={{fontSize: "1.4rem", marginBottom: "1.5rem"}}><div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question.title.rendered, search) : question.title.rendered } } /></h3>
                                            <div dangerouslySetInnerHTML={{ __html: search.length > 0 ? renderedQuestion(question?.excerpt?.rendered, search) : question?.excerpt?.rendered?.length > 340 ? question?.excerpt?.rendered?.slice(0, 340) + "..." : question?.excerpt?.rendered }} />
                                        </div>
                                        {/* Bottom Section */}
                                        <div className="row d-flex flex-row">
                                            <img src={UserComment} className="collaboration-icon" alt="Collaboration icon" style={{width: "4rem", paddingRight: ".3rem"}} /> 
                                            <div className="mt-2 col-auto d-flex flex-row p-0" style={{marginRight: "6rem"}}>{numberOfComments[0].count} people responded to this</div>
                                            <div className="col-auto">
                                            <Link to={{ pathname: `/question/${question.id}/`}} className="btn btn-primary collab-btn">View</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                } 
            }
            )}
        </>
    );
    }

function PaginatedItems({ itemsPerPage }) {
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);

  // Simulate fetching items from another resources.
  // (This could be items from props; or items loaded in a local state
  // from an API endpoint with useEffect and useState)
  const endOffset = itemOffset + itemsPerPage;
  
  const currentItems = question.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(question.length / itemsPerPage);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % question.length;
    setItemOffset(newOffset);
  };

  return (
    <>
      <Items currentItems={currentItems} />
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
// End pagination

    if ( userDetails != null) {
        if (loading === false) {
        return (
            <>
                <Navigation />
                <div className="get-help mb-5">
                    <div className='container primary'>
                        <div className='get-help-details mb-5'>
                            <div className="row mb-5">
                                <div className="col-6 d-flex align-item-center">
                                    <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">>></span><span className="small d-flex align-items-center">Ask Questions</span>
                                </div>
                                <div className="col-6 d-flex align-item-center justify-content-end">
                                <p className='small m-0 my-auto'><strong>Choose question type:</strong></p> &nbsp; &nbsp;
                                <strong>
                                <BootstrapSwitchButton
                                    checked={false}
                                    onlabel='Specific'
                                    offlabel='General'
                                    onChange={(isChecked) => {
                                        const questionType = isChecked ? 'Specific' : 'General';
                                        localStorage.setItem('questionType', questionType);
                                        setQuestionSubject(questionType)
                                    }}
                                    width={100}
                                    onstyle="info"
                                    offstyle="info"
                                />
                                </strong>
                    
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-lg-4">
                                    <p><strong>See questions from your peers</strong></p>
                                </div>
                                <div className="col-lg-4">
                                    <input type="search" className="form-control" placeholder='Start typing to search' value={search} onChange={(e) => {
                                        setSearch(e.target.value)
                                    }} />
                                </div>
                                <div className="col-lg-4 text-end">
                                    <a className="btn btn-outline-info btn-lg" onClick={()=>{setModalClass("show-modal")}}>Ask a Question</a>
                                </div>
                            </div>
                        </div>
                        <PaginatedItems itemsPerPage={15} />
                    </div>
                    
                <div className={"modal"+" "+modalClass}>
                    <div className="container" >
                        <div className="row">
                            <div className="col-12">
                                <form className="modal-popup" id="popup-form" onSubmit={handleSubmit}>
                                    <div className="modal-popup-icon">
                                        <svg
                                        onClick={()=>{
                                        setAskQuestionStatus('not published')  
                                        setModalClass("hide-modal")  
                                        setAskQuestionApi({
                                            title: '',
                                            content: '',
                                            question_image: '',
                                        })
                                    }
                                        }
                                        width="12.103323mm"
                                        height="12.105565mm"
                                        viewBox="0 0 12.103323 12.105565"
                                        version="1.1"
                                        id="svg1"
                                        xmlnsinkscape="http://www.inkscape.org/namespaces/inkscape"
                                        xmlnssodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnssvg="http://www.w3.org/2000/svg">
                                        <sodipodinamedview
                                            id="namedview1"
                                            pagecolor="#ffffff"
                                            bordercolor="#666666"
                                            borderopacity="1.0"
                                            inkscapeshowpageshadow="2"
                                            inkscapepageopacity="0.0"
                                            inkscapepagecheckerboard="0"
                                            inkscapedeskcolor="#d1d1d1"
                                            inkscapedocument-units="mm" />
                                        <defs
                                            id="defs1" />
                                        <g
                                            inkscapelabel="Layer 1"
                                            inkscapegroupmode="layer"
                                            id="layer1"
                                            transform="translate(-6.9914114,-5.8580254)">
                                            <g
                                            id="g3"
                                            transform="translate(0.35406431,-0.60696738)">
                                            <rect
                                                
                                                id="rect2"
                                                width="3.4117243"
                                                height="10.152302"
                                                x="-1.5839893"
                                                y="12.740046"
                                                ry="0.35877365"
                                                rx="0"
                                                transform="rotate(-45)" />
                                            <rect
                                                
                                                id="rect2-7"
                                                width="3.4117243"
                                                height="10.152302"
                                                x="16.125717"
                                                y="-5.1964393"
                                                ry="0.35877365"
                                                rx="0"
                                                transform="rotate(45)" />
                                            </g>
                                            </g>
                                        </svg>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 mb-4">
                                            <p className="lead"><strong>Have a technical question? Ask your peers</strong></p>
                                        </div>
                                        <div className="col-12 mb-4">
                                            <input className="form-control" type="text" name="title"  disabled={askQuestionStatus === 'published' ? true : false} value={askQuestionApi.title} onChange={handleChange} aria-label='Question field' placeholder="Type your question briefly (140 characters max.)" autoComplete='off' required />
                                            { askQuestionApi?.title?.length == 140 ?
                                            <p className="small red">Maximum characters reached!</p> : '' }
                                        </div>
                                        <div className="col-12 mb-4">
                                            <Editor
                                              apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                                              data-info="content"
                                              className="form-control" 
                                              init={{
                                                readOnly: askQuestionStatus === 'published' ? true : false,
                                                selector: 'textarea',
                                                placeholder: 'Give a detailed description of your question. Attach pictures if necessary.',
                                              toolbar: 'undo redo | bold italic underline | superscript subscript | alignleft aligncenter alignright | bullist numlist',
                                              }}
                                              onChange={handleChangeContent}
                                            />
                                        </div>
                                        <div className="col-lg-12 mb-4">
                                            <p className="m-0 small"><strong>Subject area:</strong></p>
                                            <select className="form-control form-select" name="question_subject_area"  onChange={handleChange} disabled={askQuestionStatus === 'published' ? true : false} required>
                                            <option defaultValue selected value="">Choose subject</option>
                                                {optionsArray}
                                            </select>
                                        </div>
                                        <div className="col-12 mb-4">
                                            <input className="form-control" type="file" onChange={handleFileChange} disabled={askQuestionStatus === 'published' ? true : false} />
                                        </div>
                                    </div>
                                    { askQuestionStatus === "published" ? 
                                    <div className="alert alert-success" role="alert">
                                        <p>Success! Your question has been published!</p>
                                    </div>
                                    : ''    
                                    }
                                    <button className="btn btn-info btn-lg" disabled={askQuestionStatus === 'published' ? true : false} type="submit">Submit</button>
                                </form>                 
                            </div>
                    </div>
                    </div>
                </div>
                </div>
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
        window.location.replace("/");
      }
}