import React, { useState, useMemo } from 'react';
import { CommunicationEvent, Lead, User } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarPageProps {
  communications: CommunicationEvent[];
  leads: Lead[];
  onScheduleClick: () => void;
  currentUser: User;
}

const eventColors: Record<CommunicationEvent['type'], string> = {
    call: 'bg-danger text-white',
    sms: 'bg-green-500 text-white',
    voicemail: 'bg-warning text-white',
    appointment: 'bg-primary text-white',
};

const CalendarPage: React.FC<CalendarPageProps> = ({ communications, leads, onScheduleClick, currentUser }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const userCommunications = useMemo(() => {
        if (currentUser.role === 'admin') {
            return communications;
        }
        const myName = `${currentUser.firstName} ${currentUser.lastName}`;
        const myLeadIds = new Set(leads.filter(l => l.assignedTo === myName).map(l => l.id));
        return communications.filter(comm => myLeadIds.has(comm.leadId));
    }, [communications, leads, currentUser]);

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };
    
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const renderCalendar = () => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="bg-gray-50 border border-gray-200"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = userCommunications.filter(e => e.date === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div key={day} className={`border border-gray-200 p-2 min-h-[120px] ${isToday ? 'bg-blue-50' : ''}`}>
                    <div className={`font-semibold ${isToday ? 'text-primary' : 'text-dark'}`}>{day}</div>
                    <div className="mt-1 space-y-1">
                        {dayEvents.map(event => {
                            const lead = leads.find(l => l.id === event.leadId);
                            return (
                                <div key={event.id} title={`${event.type.toUpperCase()} with ${lead?.agentName}`} className={`text-xs p-1 rounded-md truncate ${eventColors[event.type]}`}>
                                    {event.time} - {lead?.agentName || 'Unknown'}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return days;
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
                    <h2 className="text-2xl font-semibold w-48 text-center">{`${monthName} ${year}`}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
                    <button onClick={goToToday} className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium">Today</button>
                </div>
                <button onClick={onScheduleClick} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                    <i className="fas fa-plus"></i>
                    Schedule Communication
                </button>
            </div>
            
            <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
                {renderCalendar()}
            </div>
        </div>
    );
};

export default CalendarPage;