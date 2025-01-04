import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faCoins, faMoneyBill, faHouse, faPen } from '@fortawesome/free-solid-svg-icons';
import { scienceBrnaches } from '../helper';
import { Editor } from '@tinymce/tinymce-react';
import SectionImage from "../Images/rb_2582.png";
import axios from "axios";

export default function CreateQuestion() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [askQuestionStatus, setAskQuestionStatus] = useState('not published');
    const [file, setFile] = useState(null);
    const [ askQuestionContent, setAskQuestionContent ] = useState('');
    const [askQuestionApi, setAskQuestionApi] = useState({
        title: '',
        content: '',
        question_subject_area: '', 
        question_image: '',
    });

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

if (userDetails != null) {
    return(
        <>
            <Navigation />
            <main className="create-collaboration" style={{marginBottom: "0", paddingBottom: "0"}}>
                <div className="container primary" >
                    <div className="page-filter">
                        <div className="row mb-5">
                            <div className="col-12 d-flex">
                            <Link to="/" className="link-dark small d-flex align-items-center"><FontAwesomeIcon icon={faHouse} /></Link><span className="breadcrumb-slash d-flex align-items-center">></span><Link className="link-dark small d-flex align-items-center" to="/ask-questions">Ask Questions</Link><span className="breadcrumb-slash">>></span><span className="small d-flex align-items-center">Create Question</span>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h1><strong>Grow your skill set by learning from your peers.</strong></h1>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-6">
                            <img className="collaboration-page_image" src={SectionImage} alt="Image of scientist" role="presentation" />
                        </div>
                        <div className="col-lg-6">
                        <form className="form-create-job" id="popup-form" onSubmit={handleSubmit}>
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
            </main>
    </>
        );
    } else {
        window.location.replace("/");
      }
};