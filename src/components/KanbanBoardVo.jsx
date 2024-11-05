import { useEffect, useState } from 'react';
import './style.css';
import { down, display, todo, inProgress, backlog, add, cancelled } from '../assets/index.js';


const icons = [
    {
        id: 1,
        icon: todo,
    },
    {
        id: 2,
        icon: inProgress,
    },
    {
        id: 3,
        icon: backlog
    }
]

const groupingOptions = [
  { value: 'status', label: 'Status' },
  { value: 'user', label: 'User' },
  { value: 'priority', label: 'Priority' },
];

const sortingOptions = [
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

const priorityLabels = {
  4: 'Urgent',
  3: 'High',
  2: 'Medium',
  1: 'Low',
  0: 'No priority',
};

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [isDisplayOpen, setIsDisplayOpen] = useState(false);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedGrouping = localStorage.getItem('grouping');
    const savedSorting = localStorage.getItem('sorting');
    if (savedGrouping) setGrouping(savedGrouping);
    if (savedSorting) setSorting(savedSorting);

    // Fetch data from API
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => response.json())
      .then(data => {
        setTickets(data.tickets);
        setUsers(data.users);
      });
  }, []);

  useEffect(() => {
    // Save preferences to localStorage
    localStorage.setItem('grouping', grouping);
    localStorage.setItem('sorting', sorting);
  }, [grouping, sorting]);

  const sortTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
      if (sorting === 'priority') return b.priority - a.priority;
      return a.title.localeCompare(b.title);
    });
  };

  const groupTickets = () => {
    const grouped = {};

    if (grouping === 'status') {
      tickets.forEach(ticket => {
        if (!grouped[ticket.status]) grouped[ticket.status] = [];
        grouped[ticket.status].push(ticket);
      });
    } else if (grouping === 'user') {
      tickets.forEach(ticket => {
        const user = users.find(u => u.id === ticket.userId);
        const userName = user?.name || 'Unassigned';
        if (!grouped[userName]) grouped[userName] = [];
        grouped[userName].push(ticket);
      });
    } else {
      tickets.forEach(ticket => {
        const priority = priorityLabels[ticket.priority];
        if (!grouped[priority]) grouped[priority] = [];
        grouped[priority].push(ticket);
      });
    }

    // Sort tickets within each group
    Object.keys(grouped).forEach(key => {
      grouped[key] = sortTickets(grouped[key]);
    });

    return grouped;
  };

  const renderTicket = (ticket) => {
    const user = users.find(u => u.id === ticket.userId);
    
    return (
      <div key={ticket.id} className="ticket">
        <div className="ticket-header">
          <span className="ticket-id">{ticket.id}</span>
          <div className="user-avatar">
            {user?.name.charAt(0)}
            <span className="status-dot" 
                  style={{ backgroundColor: user?.available ? '#00FF00' : '#808080' }} />
          </div>
        </div>
        <h3 className="ticket-title">{ticket.title}</h3>
        <div className="ticket-tags">
          <span className="priority-tag">
            {priorityLabels[ticket.priority]}
          </span>
          {ticket.tag.map(tag => (
            <span key={tag} className="feature-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="kanban-container">
      <div className="toolbar">
        <button
          className="display-button"
          onClick={() => setIsDisplayOpen(!isDisplayOpen)}
        >
          <img src={display} alt="Display Button" />
          Display
          <img src={down} alt="down" />
        </button>
        {isDisplayOpen && (
          <div className="display-dropdown">
            <div className="dropdown-section">
              <label>Grouping</label>
              <select 
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}
              >
                {groupingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="dropdown-section">
              <label>Ordering</label>
              <select
                value={sorting}
                onChange={(e) => setSorting(e.target.value)}
              >
                {sortingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      <div className="board">
        {Object.entries(groupTickets()).map(([group, tickets]) => (
          <div key={group} className="column">
            <div className="column-header">
              <h2>{group}</h2>
              <span className="ticket-count">{tickets.length}</span>
            </div>
            <div className="ticket-list">
              {tickets.map(ticket => renderTicket(ticket))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;
