import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'
import {display, down} from '../assets/index.js'


const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sortBy, setSortBy] = useState('priority');
  const [isDropDownVisible, setDropDownVisible] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        setTickets(Array.isArray(response.data.tickets) ? response.data.tickets : []);
        console.log('Tickets fetched:', response.data.tickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setTickets([]); // Ensure tickets is an empty array on error
      }
    };
    fetchTickets();
  }, []);

  const groupBy = (tickets = [], key) => {
    return tickets.reduce((acc, ticket) => {
      const value = ticket[key] || 'Uncategorized';
      if (!acc[value]) acc[value] = [];
      acc[value].push(ticket);
      return acc;
    }, {});
  };

  // Sorting logic
  const sortTickets = (tickets, sortKey) => {
    return [...tickets].sort((a, b) => {
      if (sortKey === 'priority') {
        return b.priority - a.priority;
      } else if (sortKey === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  const groupedTickets = Array.isArray(tickets) ? groupBy(tickets, grouping) : {};


  const toggleDropdown = (_e) => {
    setDropDownVisible(!isDropDownVisible);
  };


  return (
    <main>

        <nav className='nav-container'>          
          <button onClick={toggleDropdown}                className='display-button'>
            <img src={display} alt='Display Button' />
            Display
            <img src={down} alt='Down' />
          </button>
          {
            isDropDownVisible && (
              <div style={{ marginTop: '10px' }} className='dropdown-menu'>
                <div className='menu-group'>
                  <label htmlFor="grouping">Grouping</label>
                  <select id="grouping" name="grouping">
                    <option value="status">Status</option>
                    <option value="user">User</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
                <div style={{ marginTop: '10px' }} className='menu-group'>
                  <label htmlFor="ordering">Ordering</label>
                  <select id="ordering" name="ordering">
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            )}
        </nav>

      {/* <select onChange={(e) => setGrouping(e.target.value)} value={grouping}>
          <option value="status">Group by Status</option>
          <option value="user">Group by User</option>
          <option value="priority">Group by Priority</option>
        </select>

        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
        </select> */}

      {/* Kanban Board */}
      {/* <div className="kanban-board">
        {Object.entries(groupedTickets).map(([group, tickets]) => (
          <div key={group} className="kanban-column">
            <h3>{group}</h3>
            {sortTickets(tickets, sortBy).map(ticket => (
              <div key={ticket.id} className="kanban-card">
                <h4>{ticket.title}</h4>
                <p>{ticket.description}</p>
                <p>Priority: {ticket.priority}</p>
                <p>Status: {ticket.status}</p>
                <p>User: {ticket.user}</p>
              </div>
            ))}
          </div>
        ))}
      </div> */}
      <div className='kanban-board'>

      </div>
    </main>
  )
}

export default KanbanBoard