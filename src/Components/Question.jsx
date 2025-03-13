import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from "react-router-dom";
import Navigation from "./Navigation";
import defaultImage from '../Images/5402435_account_profile_user_avatar_man_icon.svg';
import { Editor } from '@tinymce/tinymce-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from "react-loader-spinner";
import axios from "axios";
import imageCompression from "browser-image-compression";

export default function Question() {
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const editorRef = useRef(null); // Reference for the TinyMCE editor
  const [ question, setQuestion ] = useState({}); 
  const [ comments, setComments ] = useState([]);
  const [ commentStatus, setCommentStatus ] = useState("not approved");
  const [ serverComment, setServerComment ] = useState("");
  const [ successServerComment, setSuccessServerComment ] = useState("");
  const [getUsers, setGetUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [ modalClass, setModalClass ] = useState('hide');
  const { param1 } = useParams();
  const [ createComment, setCreateComment ] = useState('');
  const [loading, setLoading] = useState(true);

    // API Calls
    useEffect(() => {
      Promise.all([
        // Single question
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/questions/${param1}`,
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`
            }
          }
        ),
        // Comments
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments?post=${param1}`,
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`
            }
          }
        ),
        // All users
        axios.get(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users`,
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`
            }
          }
        )
      ])
      .then(([singleQuestion, allSingleComments, allUsers]) => {
        // Single question
        setQuestion(singleQuestion.data);
        localStorage.setItem(`quesiton${param1}`, singleQuestion?.data?.title?.rendered?.substring(0, 15));
        localStorage.setItem(`quesiton${param1}count`, singleQuestion?.data?.title?.rendered?.length);
        // Comments
        setComments(allSingleComments?.data);
        // All users
        setGetUsers(allUsers?.data);
        setLoading(false);
      })
      .catch(error=>{
        console.error(error);
      });
    }, [comments])

    let userName = "";
    let userProfileImg = "";
    let userJobInsitution = "";

    let questionPosted = Date.now() - new Date(question.date);
    // let days = Math.floor(questionPosted/(86400 * 1000));
    // Calculate total days
    let totalDays = Math.floor(questionPosted / (86400 * 1000));

    // Calculate years
    let years = Math.floor(totalDays / 365);

    // Calculate remaining days after extracting years
    let remainingDaysAfterYears = totalDays % 365;

    // Calculate months
    let months = Math.floor(remainingDaysAfterYears / 30);

    // Calculate remaining days after extracting months
    let days = remainingDaysAfterYears % 30;

    // Find detial for user
    for (let name of getUsers) {
      if ( name.id == question.author) {
        userName = name.name;
        userProfileImg = name?.acf?.user_profile_picture;
        userJobInsitution = name['acf']['user-job-Insitution'];
      }
    }
    
    // Clear editor
    function clearEditor() {
      setCreateComment(""); // Reset text content
      setCommentStatus("not approved");
      setServerComment("");
      setSuccessServerComment("");
      setFile(null); // Reset file state
      if (editorRef.current) {
        editorRef.current.setContent(""); // Clear TinyMCE editor
      }
      setModalClass("hide");
    
      // Clear file input field
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = ""; // Reset file input value
      }
    }

    const allComments = comments.map((question, index) => {
        let userName = "";
        let userProfileImg = "";
        let userJobInsitution = "";

        let questionPosted = Date.now() - new Date(question.date);
        // let days = Math.floor(questionPosted/(86400 * 1000));
        // Calculate total days
        let totalDays = Math.floor(questionPosted / (86400 * 1000));

        // Calculate years
        let years = Math.floor(totalDays / 365);

        // Calculate remaining days after extracting years
        let remainingDaysAfterYears = totalDays % 365;

        // Calculate months
        let months = Math.floor(remainingDaysAfterYears / 30);

        // Calculate remaining days after extracting months
        let days = remainingDaysAfterYears % 30;

        for (let name of getUsers) {
          if ( name.id == question.author) {
            userName = name.name;
            userProfileImg = name?.acf?.user_profile_picture;
            userJobInsitution = name['acf']['user-job-Insitution'];
          }
        }

        if (question.status === "approved") {

          return (
          <div className="card mb-4 collaboration" key={index}>
            <div className='card-body p-0'>
              <div className="questions-details mb-3">
                <div className="questions-details-name">
                  <img className="questions-details-name-img" src={userProfileImg ? userProfileImg : defaultImage} alt={userProfileImg ? userProfileImg : defaultImage} loading="lazy" />
                  <div className="questions-details-name-info">
                    <p><strong>{userName}</strong></p>
                    <div className="questions-details-posted">
                      {userJobInsitution ?
                      (<div>
                        <p>{userJobInsitution}</p>
                      </div>) : ("")
                      }
                    <p>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: question.content.rendered }} />
              {question['acf'] && question['acf']['answer_image'] && 
                <div className="question-image mt-3">
                  <a href={question?.acf?.answer_image} data-lightbox={userName + "image" + index}>
                    <img className="question-image-item" src={question?.acf?.answer_image} alt={question?.acf?.answer_image}  loading="lazy" />
                  </a>
                </div>}
            </div>
          </div>
          )
        }
      })

    // Handle file change
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    }

    // TinyMC Handle Change
    // function handleChangeContent(e) {
    //   setCreateComment(e.target.getContent());
    // }

    // handle submit
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        let imageUrl = "";
        
        if (file && userDetails) {
          // Image compression options
          const options = {
            maxSizeMB: 1, // Max file size (1MB)
            maxWidthOrHeight: 1024, // Resize image
            useWebWorker: true,
          };
    
          console.log("Compressing image...");
          
          // Compress image before upload
          const compressedFile = await imageCompression(file, options);
          const finalFile = new File([compressedFile], file.name, { type: file.type });
    
          // Prepare form data
          const formData = new FormData();
          formData.append("file", finalFile);
    
          console.log("Uploading image...");
    
          // Upload the image
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/media`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${userDetails.token}`,
              },
            }
          );
          imageUrl = response.data.source_url;
        }
    
        // Create comment
        const commentResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/comments`,
          {
            author: userDetails.id,
            author_email: userDetails.email,
            author_name: `${userDetails.firstName} ${userDetails.lastName}`,
            content: createComment,
            post: param1,
            status: "approved",
            acf: {
              answer_image: imageUrl,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`,
            },
          }
        );
    
        setCommentStatus(commentResponse.data.status);
        setSuccessServerComment("Success! Your comment has been published.");
        setCreateComment(""); 
        // tinymce.get("editorId")?.setContent(""); // Clear TinyMCE after submission
    
        // Update user points
        const currentPoints = JSON.parse(localStorage.getItem("userPoints")) || 0;
        const updatedPoints = currentPoints + 2;
    
        console.log("Updating user points...");
    
        await axios.post(
          `${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${userDetails.id}`,
          {
            acf: {
              "user-points": updatedPoints,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`,
            },
          }
        );
    
        console.log("User points updated:", updatedPoints);
        
      } catch (error) {
        console.error("Error:", error.response?.data || error);
    
        if (
          error.response?.data?.message ===
          "Duplicate comment detected; it looks as though you&#8217;ve already said that!"
        ) {
          setServerComment("Oops! You've already submitted this answer.");
        } else {
          setServerComment("Something went wrong. Please try again.");
        }
      }
    };

    if (window.tinymce?.get("editorId")) {
      window.tinymce.get("editorId").setContent("");
    }

  if ( userDetails != null) {
    if (loading === false) {
return (
    <>
        <Navigation />
        <div className="container primary questions">
            <div className="row mb-5">
                <div className="col-12 d-flex">
                    <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash">></span><Link to="/ask-questions" className="link-dark small">Ask Questions</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">{localStorage.getItem(`quesiton${param1}`)}{localStorage.getItem(`quesiton${param1}count`) > 15 ? '...' : ''}</span>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="question mx-auto">
                        <div className="card collaboration question-item">
                          <div className="card-body">
                          <div className="questions-details">
                              <div className="questions-details-name">
                                <img className="questions-details-name-img" src={userProfileImg ? userProfileImg : defaultImage} alt={userProfileImg ? userProfileImg : defaultImage} loading="lazy" />
                                <div className="questions-details-name-info">
                                    <p><strong>{userName}</strong></p>
                                    <div className="questions-details-posted">
                                      {userJobInsitution ?
                                      (<div>
                                          <p>{userJobInsitution}</p>
                                      </div>) : ("")
                                      }
                                    <p>{years > 0 ? `${years} years ago` : months > 0 ? `${months} months ago` : days == 0 ? "Posted today" : `${days} days ago`}</p>
                                    </div>
                                </div>
                              </div>
                          </div>
                            <div>
                                <p><strong>{question.title && question.title.rendered}</strong></p>
                                {question.content && ( <div dangerouslySetInnerHTML={{ __html: question.content.rendered }} />)}
                                {question['acf'] && question['acf']['question_image'] && 
                                <div className="question-image mt-3">
                                  <a href={question?.acf?.question_image} data-lightbox={userJobInsitution + "item"}>
                                      <img className="question-image-item" src={question?.acf?.question_image} alt={question?.acf?.question_image} loading='lazy'/>
                                  </a>
                                </div>}
                                <button className="btn btn-sm btn-outline-info ml-auto" onClick={()=>{setModalClass("show")}}>Answer</button>
                            </div>
                            <div className={"new-comment"+' '+"mt-3"+" "+modalClass}>
                                <div className="card">
                                  <div className="card-body question-box">
                                  <div className="modal-popup-icon question-icon-box">
                                    <svg
                                    onClick={clearEditor}                                    
                                    className="question-icon"
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
                                    <p>Type your answer below</p>
                                </div>
                            
                                    <form onSubmit={handleSubmit}>
                                      <Editor
                                        apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                                        onInit={(evt, editor) => (editorRef.current = editor)}
                                        data-info="content"
                                        className="form-control form-control-lg" 
                                        init={{
                                          selector: 'textarea',
                                          placeholder: 'Give a detailed description of your question. Attach pictures if necessary.',
                                        toolbar: 'undo redo | bold italic underline | superscript subscript | alignleft aligncenter alignright | bullist numlist',
                                        }}
                                        // onChange={handleChangeContent}
                                        onEditorChange={(content) => setCreateComment(content)}

                                      />
                                      
                                      <div className="row">
                                        <div className="col-4 mt-4">
                                          <input className="form-control form-control-lg" type="file" onChange={handleFileChange} disabled={commentStatus === "approved" ? true : false} />
                                        </div>
                                        <div className="col-8 text-end mt-4">
                                          <button className="btn btn-info btn-lg collab-btn" type="submit">Submit</button>
                                        </div>
                                        { serverComment !== "" ? 
                                        <div className="col-12 mt-4">
                                          <div className="alert alert-danger" role="alert">
                                              <p>{serverComment}</p>
                                          </div>
                                        </div> 
                                        : ''   
                                        }
                                        { successServerComment ? 
                                        <div className="col-12 mt-4">
                                          <div className="alert alert-success" role="alert">
                                              <p>{successServerComment}</p>
                                          </div>
                                        </div> 
                                        : ''   
                                        }
                                      </div>
                                    </form>
                                  </div>
                                </div>
                            </div>
                          </div>  
                        </div>
                        <p className="small mt-5"><strong>See All Answers</strong></p>
                        <hr className="mb-5"></hr>
                        <div className="question-comments">
                        {comments.length > 0 ? allComments : <p>No answers yet...answer this question.</p>}
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
