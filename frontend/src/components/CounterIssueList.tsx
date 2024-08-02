import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from './SocketProvider';
import { useLocation, useNavigate  } from 'react-router-dom';
import './CounterIssueList.css';

interface Issue {
  id: number;
  name: string;
  telephoneNo: string;
  email: string;
  issueDescription: string;
  createdAt: string;
  counterId: number;
  userId: number;
  staticIndex: number;
}


const CounterIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counterStatus, setCounterStatus] = useState(false);
  const [initialIssues, setInitialIssues] = useState<Issue[]>([]);
  const pageSize = 5;
  const navigate   = useNavigate();
  const location = useLocation();

  const token = sessionStorage.getItem('token');
  
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const counterId = sessionStorage.getItem('counterId');
    if (!counterId) {
      console.error('Counter ID not found in sessionStorage');
      return;
    }

  
    const params = new URLSearchParams(location.search);
    const currentPage = params.get('page');
    if (currentPage) {
      setPage(parseInt(currentPage, 10));
    }

    const storedIssues = sessionStorage.getItem('issues');
    const token = sessionStorage.getItem('token');

    const fetchIssues = async (page: number) => {
      try {
        const response = await axios.post('http://localhost:3000/issue/unsolved', {
          counterId,
          page,
          pageSize,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

        setIssues(response.data.issues);
        setTotalPages(response.data.totalPages);

        sessionStorage.setItem('issues', JSON.stringify(response.data.issues));

      } catch (error) {
        console.error('Failed to fetch issues', error);
      }
    };


    const fetchCounterStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/counter/status/${counterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCounterStatus(response.data.status);
        console.log("Counter status",response.data.status);
      } catch (error) {
        console.error('Failed to fetch counter status', error);
      }
    };

    fetchIssues(page);
    fetchCounterStatus();

    socket.on('newIssue', (data) => {
      if (data.counterId.toString() === counterId) {
        console.log('Received new Issue event:', data);
        fetchIssues(page);
      }
    });

    socket.on('issueSolved', (data) => {
      console.log('Received issueSolved event:', data);
      if (data.counterId.toString() === counterId) {
          fetchIssues(page); 
      }
    });


    return () => {
      socket.off('newIssue');
      socket.off('issueSolved');
    };
  }, [page, location.search]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      navigate(`/counter-dashboard?page=${page + 1}`);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      navigate(`/counter-dashboard?page=${page - 1}`);
    }
  };

  const handleViewClick = async(issue: Issue) => {
    console.log('View clicked for issue ID:', issue.id);
    const issueIndex = issue.staticIndex;
    const counterId = sessionStorage.getItem('counterId'); 

    // Store issueId and issueIndex in sessionStorage
    sessionStorage.setItem('issueId', issue.id.toString());
    sessionStorage.setItem('issueIndex', issueIndex?.toString() || '0');
    sessionStorage.setItem('currentPage', page.toString());
    try {
      await axios.post('http://localhost:3000/issue/update-indices', { issueId: issue.id, issueIndex: issue.staticIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/issue/${issue.id}`);
    } catch (error) {
      console.error('Failed to set current index', error);
    }
  };

  const handleCallClick = async (issue: Issue) => {
    const viewButton = document.getElementById(`view-button-${issue.id}`);
    if (viewButton) {
      viewButton.style.display = 'block';
    }

    const callButton = document.getElementById(`call-button-${issue.id}`);
    if (callButton) {
      if (callButton.innerText === 'Call') {
        await sendNotification(issue.userId, issue.id, 'Your the now in the requested queue. Please be Prepare');
        callButton.innerText = 'Recall';
      } else {
        await sendNotification(issue.userId, issue.id, 'Your the now in the requested queue. Please be Prepare');
      }
    }

    try {
      await axios.post('http://localhost:3000/issue/update-indices', { issueId: issue.id, issueIndex: issue.staticIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to update indices', error);
    }
  };

  const sendNotification = async (notifUserId: number, issueId: number, content: string ) => {
    try {
      await axios.post('http://localhost:3000/notification/add', {
        notfiUserId: notifUserId,
        issueId: issueId,
        content: content,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw new Error('Failed to send notification');
    }
  };

  const handleToggleCounterStatus = async () => {
    const counterId = sessionStorage.getItem('counterId');
    if (!counterId) {
        console.error('CounterId not found in session');
        return;
    }
    try {
        if (counterStatus) { 
            const response = await axios.post('http://localhost:3000/counter/toggle-status', { counterId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setCounterStatus(false);
        } else  {  
          const response = await axios.get('http://localhost:3000/counter/open', 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Open counters count", response.data.count);

          if (response.data.count <= 0) {
            alert('No other counters are open. Please open another counter before closing this one.');
            return;
          }
          await axios.post('http://localhost:3000/counter/toggle-status', { counterId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const newCounterResponse = await axios.post('http://localhost:3000/issue/reassign', { counterId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log(`Issues reassigned to counter with ID: ${newCounterResponse.data.newCounterId}`);
          setCounterStatus(true);
          console.log('Emitting counter closed event');
          socket.emit('counterClosed', { counterId });
        }
    } catch (error) {
        console.error('Failed to update counter status', error);
    }
};

  return (
    <div>
      <div className="close mb-5">
        <button 
          type="button" 
          className={`btn ${counterStatus ? 'btn-success' : 'btn-danger'} float-right`}
          onClick={handleToggleCounterStatus}
      >
          {counterStatus ? 'Open Counter' : 'Close Counter'}
        </button>
      </div>
      {issues.map((issue) => (
        <div key={issue.id} className="issue-card-list">
          <div className="issue-number">{issue.staticIndex}</div>
          <div className="user-details">
            <p>{issue.name}</p>
            <p>{issue.telephoneNo}</p>
          </div>
          <div className="issue-buttons">
            <button id={`view-button-${issue.id}`} className="view-button" style={{ display: 'none' }} onClick={() => handleViewClick(issue)}>View</button>
            <button id={`call-button-${issue.id}`} className="call-button" onClick={() => handleCallClick(issue)}>Call</button>
          </div>
        </div>
      ))}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
        <span>{page} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default CounterIssues;
