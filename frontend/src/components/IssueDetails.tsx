import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './issueDetails.css';
import axios from 'axios';
import { socket } from '..';

interface Issue {
    id: number,
    issueDescription :string,
    telephoneNo: string,
    name: string,
    counterId: number,
    userId: number,
}

const IssueDetails: React.FC = () => {
  const counterId = sessionStorage.getItem('counterId');
  const storedIssueId = sessionStorage.getItem('issueId');
  const storedIssueIndex = sessionStorage.getItem('issueIndex');
  const currentPage = sessionStorage.getItem('currentPage') || '1';
  
  const [issue, setIssue] = useState<Issue>();
  const [isLastIssue, setIsLastIssue] = useState<boolean>(false);
  const navigate = useNavigate();

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        console.log(`Stored Issue ID: ${storedIssueId}, Stored Issue Index: ${storedIssueIndex}`);
        console.log(`Fetching issue details for ID: ${storedIssueId}`);
        const response = await axios.get(`http://localhost:3000/issue/${storedIssueId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('API Response:', response.data);
        setIssue(response.data);
      } catch (error) {
        console.error('Failed to fetch issue details', error);
      }
    };

    fetchIssue();
  }, [storedIssueId]);

  const handleDoneClick = async () => {
    await updateIssueStatus();
    navigate(`/counter-dashboard?page=${currentPage}`);
  };

  const handleDoneAndCallNextClick = async () => {
    await updateIssueStatus();
    await callNextIssue();
  };

  const updateIssueStatus = async () => {
    if (storedIssueIndex && counterId && storedIssueId) {
      try {
        console.log('Emitting issueFixed event');
        socket.emit('issueFixed', { id: Number(storedIssueId), counterId });
        await axios.put(`http://localhost:3000/issue/${storedIssueId}/status`, { status: true, counterId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to update issue status', error);
      }
    } else {
      console.error('Issue index, counter ID, or issue ID not found in sessionStorage');
    }
  };

  const callNextIssue = async () => {
    if (storedIssueIndex && counterId) {
      try {
        const response = await axios.post('http://localhost:3000/issue/unsolved', {
          counterId: issue?.counterId,
          page: 1,
          pageSize: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } });
        console.log("done & next",response);
        const nextIssue = response.data.issues[0];
        if (nextIssue) {
          const currentIssueIndex = parseInt(sessionStorage.getItem('issueIndex') || '0', 10);
          const nextIssueIndex = currentIssueIndex + 1;

          const newIssueIndex = parseInt(storedIssueIndex) + 1;
          await axios.post('http://localhost:3000/issue/update-indices', { issueId: nextIssue.id, issueIndex: newIssueIndex },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          await sendNotification(nextIssue.userId, nextIssue.id, 'Your the now in the requested queue. Please be Prepare');

          sessionStorage.setItem('issueId', nextIssue.id.toString());
          sessionStorage.setItem('issueIndex', nextIssueIndex.toString());
          navigate(`/issue/${nextIssue.id}`);
        } else {
          navigate(`/counter-dashboard?page=${currentPage}`);
        }
      } catch (error) {
        console.error('Failed to fetch next issue', error);
      }
    } else {
      console.error('Issue index or counter ID not found in sessionStorage');
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
    
  if (!issue) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='issue-card'>
        <div className="issue-header">
          <div className="issue-number">
            {storedIssueIndex}
          </div>
          <div className="user-details">
            <p>{issue.name}</p>
            <p>{issue.telephoneNo}</p>
          </div>
        </div>
        <div className="issue-description">
          <h5>Issue</h5>
          <p>{issue.issueDescription}</p>
        </div>
      </div>
      <div className='button-container'>
        <button className="btn btn-primary" onClick={handleDoneClick}>Done</button>
        <button className="btn btn-danger" onClick={handleDoneAndCallNextClick} disabled={isLastIssue}>Done & Call Next</button>
      </div>
    </div>
  );
};

export default IssueDetails;
