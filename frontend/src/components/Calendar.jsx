import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { calendarAPI } from '../services/api';
import './Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayTexts, setDayTexts] = useState({});
  const [loading, setLoading] = useState(false);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDay = firstDayOfMonth.getDay();
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Load calendar notes when component mounts or date changes
  useEffect(() => {
    if (user) {
      loadCalendarNotes();
    }
  }, [user, currentDate]);

  const loadCalendarNotes = async () => {
    try {
      setLoading(true);
      const response = await calendarAPI.getNotes();
      const notes = response.data;
      
      // Convert notes to dayTexts format
      const notesMap = {};
      notes.forEach(note => {
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${new Date(note.date).getDate()}`;
        notesMap[dateKey] = note.content;
      });
      
      setDayTexts(notesMap);
    } catch (error) {
      console.error('Error loading calendar notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCalendarNote = async (dayKey, content) => {
    if (!user) return;
    
    try {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dayKey.split('-')[2]));
      const dateString = date.toISOString().split('T')[0];
      
      await calendarAPI.createNote({
        date: dateString,
        content: content
      });
    } catch (error) {
      console.error('Error saving calendar note:', error);
    }
  };

  const renderCalendar = () => {
    const calendar = [];
    const numRows = 6;

    for (let i = 0; i < numRows; i++) {
      const week = [];

      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j - startingDay + 1;
        const dayKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${dayIndex}`;
        const uniqueKey = `${i}-${j}`;

        if (dayIndex <= 0 || dayIndex > totalDays) {
          week.push(<div className={`day empty-day`} key={uniqueKey}></div>);
        } else {
          const isCurrentDay = isToday(dayIndex);
          week.push(
            <div 
              className={`day day-box ${isCurrentDay ? 'today' : ''}`} 
              key={uniqueKey}
            >
              <div className="day-number">{dayIndex}</div>
              {isCurrentDay && <div className="today-label">Today</div>}
              <TextareaWithBullets 
                dayKey={dayKey}
                value={dayTexts[dayKey] || ''}
                onChange={(value) => {
                  setDayTexts(prev => ({ ...prev, [dayKey]: value }));
                  saveCalendarNote(dayKey, value);
                }}
                disabled={!user}
              />
            </div>
          );
        }
      }

      calendar.push(
        <div className="week" key={i}>
          {week}
        </div>
      );
    }

    return calendar;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loader"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h1>
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h1>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      <div className="days">
        <div className="day-header">Sun</div>
        <div className="day-header">Mon</div>
        <div className="day-header">Tue</div>
        <div className="day-header">Wed</div>
        <div className="day-header">Thu</div>
        <div className="day-header">Fri</div>
        <div className="day-header">Sat</div>
      </div>
      <div className="calendar-grid">
        {renderCalendar()}
      </div>
    </div>
  );
};

const TextareaWithBullets = ({ dayKey, value, onChange, disabled }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(value + '\n• ');
    }
  };

  return (
    <textarea
      className="text-box"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={disabled ? "Please log in to add notes..." : "Add notes..."}
      disabled={disabled}
    />
  );
};

export default Calendar;

