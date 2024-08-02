import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "./Header";
import Footer from "./Footer";
import './Login.css';

const UserLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                userName: username,
                password: password,
            });
            console.log('Login response:', response.data);

            // Extracting nested data
            const { token, userId, userType, counterId } = response.data.response;

            if (userType === 'user') {
                sessionStorage.setItem('userId', userId.toString());
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('userType', userType);
                sessionStorage.setItem('counterId', counterId?.toString() || ''); // Handle counterId being optional
                sessionStorage.setItem('username', username);
                console.log('Logged in successfully');
                console.log('userId: ', userId);
                navigate('/user-dashboard');
            } else {
                setError('Please use correct login');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                const responseMessage = error.response.data.message;
                if (responseMessage === 'No counters available') {
                    setError('No counters available');
                } else if (responseMessage === 'Invalid username or password') {
                    setError('Invalid username or password');
                } else {
                    setError('Login failed. Please check your credentials.');
                }
            } else {
                console.error('Login failed: ', error);
                setError('Login failed. Please check your credentials.');
            }
        }
    };

    return (
        <div className="container mt-2">
            <Header />
            <div className="logBody w-100">
                <h2 className="log mt-5 mb-3">User Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin} className="w-100 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                    <div className="mb-3 row">
                        <label className="form-label" htmlFor="userusername">Username:</label>
                        <input 
                            id="userusername"
                            type="text"
                            placeholder="Username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-3 row">
                        <label className="form-label" htmlFor="userpassword">Password:</label>
                        <input 
                            id="userpassword"
                            type="password" 
                            placeholder="Password"
                            className="form-control"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary mb-4">Login</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default UserLogin;
