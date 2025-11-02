import React, { useState, useMemo } from 'react';
import { Lead, TeamMember, User } from '../types';

interface DashboardPageProps {
  leads: Lead[];
  team: TeamMember[];
  currentUser: User;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl ${color}`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <div className="text-3xl font-bold text-dark">{value}</div>
            <div className="text-gray">{title}</div>
        </div>
    </div>
);

const SalesDashboard: React.FC<{ leads: Lead[]; currentUser: User }> = ({ leads, currentUser }) => {
    const myName = `${currentUser.firstName} ${currentUser.lastName}`;
    const myLeads = useMemo(() => leads.filter(l => l.assignedTo === myName), [leads, myName]);

    const totalLeads = myLeads.length;
    const contactedLeads = myLeads.filter(l => l.status !== 'new').length;
    const appointmentsSet = myLeads.filter(l => l.status === 'appointment').length;
    const conversionRate = totalLeads > 0 ? ((appointmentsSet / totalLeads) * 100).toFixed(1) : 0;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Your Personal Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="My Total Leads" value={totalLeads} icon="fa-users" color="bg-primary" />
                <StatCard title="Leads Contacted" value={contactedLeads} icon="fa-headset" color="bg-warning" />
                <StatCard title="Appointments Set" value={appointmentsSet} icon="fa-calendar-check" color="bg-success" />
                <StatCard title="My Conversion Rate" value={`${conversionRate}%`} icon="fa-chart-line" color="bg-danger" />
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-dark">My Most Recent Leads</h2>
                 <div className="divide-y divide-gray-200">
                    {myLeads.slice(0, 5).map(lead => (
                        <div key={lead.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-dark">{lead.agentName}</p>
                                <p className="text-sm text-gray">{lead.address}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-semibold capitalize px-2 py-1 rounded-full ${
                                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                                    lead.status === 'follow-up needed' ? 'bg-yellow-100 text-yellow-800' :
                                    lead.status === 'appointment' ? 'bg-green-100 text-green-800' : 
                                    'bg-gray-100 text-gray-800'
                                }`}>{lead.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DealerDashboard: React.FC<{ leads: Lead[]; currentUser: User }> = ({ leads, currentUser }) => {
    const myName = `${currentUser.firstName} ${currentUser.lastName}`;
    const myLeads = useMemo(() => leads.filter(l => l.assignedTo === myName), [leads, myName]);

    const activeAppointments = myLeads.filter(l => l.status === 'appointment').length;
    const completedJobs = myLeads.filter(l => l.status === 'closed job').length;
    const lostJobs = myLeads.filter(l => l.status === 'lost job').length;
    const totalRevenue = myLeads.reduce((sum, lead) => sum + (lead.jobRevenue || 0), 0);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Dealer Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Active Appointments" value={activeAppointments} icon="fa-calendar-check" color="bg-primary" />
                <StatCard title="Completed Jobs" value={completedJobs} icon="fa-check-double" color="bg-success" />
                <StatCard title="Lost Jobs" value={lostJobs} icon="fa-times-circle" color="bg-danger" />
                <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="fa-dollar-sign" color="bg-yellow-500" />
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-dark">My Recent Activity</h2>
                 <div className="divide-y divide-gray-200">
                    {myLeads.slice(0, 5).map(lead => (
                        <div key={lead.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-dark">{lead.address}</p>
                                <p className="text-sm text-gray">{lead.agentName}</p>
                            </div>
                             <div className="text-right">
                                <p className={`text-sm font-semibold capitalize px-2 py-1 rounded-full ${
                                    lead.status === 'appointment' ? 'bg-blue-100 text-blue-800' :
                                    lead.status === 'closed job' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {lead.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<{ leads: Lead[]; team: TeamMember[] }> = ({ leads, team }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedSalesPersonId, setSelectedSalesPersonId] = useState('all');

    const salesTeam = useMemo(() => team.filter(m => m.role === 'sales'), [team]);

    const filteredLeads = useMemo(() => {
        const selectedMember = salesTeam.find(m => m.id.toString() === selectedSalesPersonId);
        const memberName = selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : null;

        return leads.filter(lead => {
            const leadDate = new Date(lead.dateAdded);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const matchesDate = (!start || leadDate >= start) && (!end || leadDate <= end);
            const matchesSalesPerson = selectedSalesPersonId === 'all' || lead.assignedTo === memberName;

            return matchesDate && matchesSalesPerson;
        });
    }, [leads, startDate, endDate, selectedSalesPersonId, salesTeam]);

    const totalLeads = filteredLeads.length;
    const newLeads = filteredLeads.filter(l => l.status === 'new').length;
    const followUpNeeded = filteredLeads.filter(l => l.status === 'follow-up needed').length;
    const appointmentsSet = filteredLeads.filter(l => l.status === 'appointment').length;
    const conversionRate = totalLeads > 0 ? ((appointmentsSet / totalLeads) * 100).toFixed(1) : 0;
    const totalRevenue = filteredLeads.reduce((sum, lead) => sum + (lead.jobRevenue || 0), 0);
    
    return (
         <div>
            <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="sales-person" className="block text-sm font-medium text-gray-700">Sales Person</label>
                        <select id="sales-person" value={selectedSalesPersonId} onChange={e => setSelectedSalesPersonId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="all">All Sales Team</option>
                            {salesTeam.map(person => (
                                <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => { setStartDate(''); setEndDate(''); setSelectedSalesPersonId('all'); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full">
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Leads" value={totalLeads} icon="fa-users" color="bg-primary" />
                <StatCard title="New Leads" value={newLeads} icon="fa-user-plus" color="bg-blue-500" />
                <StatCard title="Follow-up Needed" value={followUpNeeded} icon="fa-hourglass-half" color="bg-yellow-500" />
                <StatCard title="Appointments Set" value={appointmentsSet} icon="fa-calendar-check" color="bg-purple-500" />
                <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon="fa-chart-line" color="bg-red-500" />
                <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="fa-dollar-sign" color="bg-green-500" />
            </div>
        </div>
    );
}


const DashboardPage: React.FC<DashboardPageProps> = ({ leads, team, currentUser }) => {
    if (currentUser.role === 'sales') {
        return <SalesDashboard leads={leads} currentUser={currentUser} />;
    }
    
    if (currentUser.role === 'dealers') {
        return <DealerDashboard leads={leads} currentUser={currentUser} />;
    }

    // Default to Admin Dashboard for admin and other roles
    return <AdminDashboard leads={leads} team={team} />;
};

export default DashboardPage;