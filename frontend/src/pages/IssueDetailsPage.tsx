import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import CounterNavBar from "../components/CounterNavBar";
import IssueDetails from "../components/IssueDetails";
import '../index.css'
import axios from "axios";

const IssueDetailsPage: React.FC = () => {
    return (
        <div className="container mt-2">
            <Header />
            <CounterNavBar />
                <div className="container mt-5">
                    <div className="close mb-2">
                        <IssueDetails />
                    </div>
                </div>
             <Footer />   
        </div>
    );
};

export default IssueDetailsPage;