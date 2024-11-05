import React, { useState, useEffect, useRef } from 'react';
import './demostyle.css';
// import {backlog, todo, inProgress, Done, cancelled} from '../assets/index.js'
import { ReactComponent as BacklogIcon } from '../assets/Backlog.svg';
import { ReactComponent as TodoIcon } from '../assets/To-do.svg';
import {ReactComponent as InProgressIcon} from '../assets/in-progress.svg';
import {ReactComponent as DoneIcon} from '../assets/Done.svg';
import {ReactComponent as CancelledIcon} from '../assets/Cancelled.svg';
import {ReactComponent as DisplayIcon} from '../assets/Display.svg';
import {ReactComponent as DownIcon} from '../assets/down.svg';


const priorityMap = {
  4: { name: 'Urgent', icon: '🔴' },
  3: { name: 'High', icon: '🟠' },
  2: { name: 'Medium', icon: '🟡' },
  1: { name: 'Low', icon: '🟢' },
  0: { name: 'No priority', icon: '⚪' },
};

const statusMap = {
  'Backlog': { icon: <BacklogIcon /> },
  'Todo': { icon: <TodoIcon /> },
  'In progress': { icon: <InProgressIcon /> },
  'Done': { icon:  <DoneIcon />},
  'Canceled': { icon: <CancelledIcon /> },
};

const DemoBoard = () => {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [grouping, setGrouping] = useState('status');
    const [sorting, setSorting] = useState('priority');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
  
    useEffect(() => {
      const fetchData = async () => {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        const data = await response.json();
        setTickets(data.tickets);
        setUsers(data.users);
      };
      fetchData();
  
      // Load saved state
      const savedGrouping = localStorage.getItem('grouping');
      const savedSorting = localStorage.getItem('sorting');
      if (savedGrouping) setGrouping(savedGrouping);
      if (savedSorting) setSorting(savedSorting);
  
      // Close dropdown when clicking outside
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    useEffect(() => {
      // Save state
      localStorage.setItem('grouping', grouping);
      localStorage.setItem('sorting', sorting);
    }, [grouping, sorting]);
  
    const groupTickets = (tickets) => {
      if (grouping === 'status') {
        return tickets.reduce((acc, ticket) => {
          acc[ticket.status] = [...(acc[ticket.status] || []), ticket];
          return acc;
        }, {});
      } else if (grouping === 'user') {
        return tickets.reduce((acc, ticket) => {
          const user = users.find(u => u.id === ticket.userId);
          acc[user?.name || 'Unassigned'] = [...(acc[user?.name || 'Unassigned'] || []), ticket];
          return acc;
        }, {});
      } else {
        return tickets.reduce((acc, ticket) => {
          acc[priorityMap[ticket.priority].name] = [
            ...(acc[priorityMap[ticket.priority].name] || []),
            ticket,
          ];
          return acc;
        }, {});
      }
    };
  
    const sortTickets = (tickets) => {
      if (sorting === 'priority') {
        return [...tickets].sort((a, b) => b.priority - a.priority);
      } else {
        return [...tickets].sort((a, b) => a.title.localeCompare(b.title));
      }
    };
  
    const groupedAndSortedTickets = groupTickets(sortTickets(tickets));
  
    return (
      <div className="kanban-board">
        <div className="controls" ref={dropdownRef}>
          <button className="display-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <DisplayIcon />
            Display 
            <DownIcon />
          </button>
          {isDropdownOpen && (
            <div className="dropdown">
              <div className="dropdown-item">
                <label htmlFor="grouping">Grouping</label>
                <select
                  id="grouping"
                  value={grouping}
                  onChange={(e) => setGrouping(e.target.value)}
                >
                  <option value="status">By Status</option>
                  <option value="user">By User</option>
                  <option value="priority">By Priority</option>
                </select>
              </div>
              <div className="dropdown-item">
                <label htmlFor="sorting">Ordering</label>
                <select
                  id="sorting"
                  value={sorting}
                  onChange={(e) => setSorting(e.target.value)}
                >
                  <option value="priority">By Priority</option>
                  <option value="title">By Title</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="columns">
          {Object.entries(groupedAndSortedTickets).map(([group, tickets]) => (
            <div key={group} className="column">
              <div className="column-header">
                <div className="column-title">
                  {grouping === 'status' && statusMap[group]?.icon}
                  {grouping === 'priority' && priorityMap[group.split(' ')[0]]?.icon}
                  <h2>{group}</h2>
                  <span className="ticket-count">{tickets.length}</span>
                </div>
                <div className="column-actions">
                  <button className="icon-button">+</button>
                  <button className="icon-button">⋯</button>
                </div>
              </div>
              {tickets.map((ticket) => (
                <div key={ticket.id} className="card">
                  <div className="card-header">
                    <span className="ticket-id">{ticket.id}</span>
                    {grouping !== 'user' && (
                      <div className="user-avatar">
                        {users.find(u => u.id === ticket.userId)?.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="card-title">{ticket.title}</h3>
                  <div className="card-footer">
                    {grouping !== 'priority' && (
                      <span className="priority-icon">
                        {priorityMap[ticket.priority].icon}
                      </span>
                    )}
                    {ticket.tag.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
  );
}

export default DemoBoard