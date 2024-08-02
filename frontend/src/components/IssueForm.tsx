import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { socket } from "..";

const IssueForm: React.FC = () => {
    const [name, setName] = useState('');
    const [telephoneNo, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [issueDescription, setDescription] = useState('');
    const [error, seterror] = useState('');
    const [success, setSuccess] = useState('');
    const [hasIssue, setHasIssue] = useState(false);
    const navigate = useNavigate();

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const checkExistingIssue = async () => {
            const userId = sessionStorage.getItem('userId');
            if (userId) {
                try {
                    const response = await axios.get(`http://localhost:3000/issue/check/${userId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (response.data.hasIssue) {
                        setHasIssue(true);
                    }
                } catch (error) {
                    console.error('Failed to check existing issue', error);
                }
            }
        };

        checkExistingIssue();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        
        if(!name || !telephoneNo || !email || !issueDescription) {
            seterror('All fields require')
        }
        if (!userId) {
            seterror('User not login');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/issue/addIssue', {
                name,
                telephoneNo,
                email,
                issueDescription,
                userId
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
            console.log('Issue submitted successfully', response.data);
            setSuccess('Issues submitted successfully');

            console.log('Issue submitted event emitted', response.data);
            socket.emit('newIssueSubmitted', response.data);

            //clear form fields
            setName('');
            setTelephone('');
            setEmail('');
            setDescription('');

            navigate('/ongoing-queue');
        } catch (error:any) {
            console.error('Failed to submit issue', error);
            if (error.response?.data?.error === 'Cannot add issue. All counters are closed.') {
                seterror('Cannot add issue. All counters are closed.');
            } else {
                seterror('Failed to submit issue');
            }
            setSuccess('');
        }
    };

    return (
        <div className="container mt-4">
            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="col mb-2">
                    <label htmlFor="name" className="form-label">Name:</label>
                    <input
                        id="name" 
                        type="text"
                        className="form-control"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="col mb-2">
                    <label htmlFor="telephoneNo" className="form-label">Telephone:</label>
                    <input
                        id="telephoneNo" 
                        type="text"
                        className="form-control"
                        placeholder="Telephone"
                        value={telephoneNo}
                        onChange={(e) => setTelephone(e.target.value)}
                        required
                    />
                </div>
                <div className="col mb-2">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input
                        id="email" 
                        type="text"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="col mb-2">
                    <label htmlFor="issueDescription" className="form-label">Issue:</label>
                    <textarea
                        id="issueDescription" 
                        className="form-control"
                        placeholder="Issue"
                        value={issueDescription}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        required
                    />
                </div>
        
                <div className="text-end mt-4 mb-4">
                    <button type="submit" className="btn btn-primary" disabled={hasIssue}>Submit</button>
                </div>
            </form>
        </div>
    );
};

export default IssueForm;

