import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import CounterNavBar from "../components/CounterNavBar";
import CounterIssueList from "../components/CounterIssueList";
import '../index.css'
import axios from "axios";

const CounterDashboard: React.FC = () => {

    return (
        <div className="container mt-2">
            <Header />
            <CounterNavBar />
                <div className="container mt-2">
                    <CounterIssueList />
                </div>
             <Footer />   
        </div>
    );
};

export default CounterDashboard;