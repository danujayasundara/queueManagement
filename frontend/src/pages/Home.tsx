import React from "react";
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import './Home.css';

const Home: React.FC = () => {
    return (
        <div className="container mt-2">
            <Header />
                <div className="home-content container text-center">
                    <h1 className="display-4">Welcome to the queue management system</h1>
                    <div className="login-links d-flex justify-content-end">
                        <Link to="/counter-login" className="mx-2 mb-2">Counter User Login</Link>
                        <Link to="/user-login" className="mx-2 mb-2">User Login</Link>
                    </div>
                </div>
             <Footer />   
        </div>
    );
};

export default Home;