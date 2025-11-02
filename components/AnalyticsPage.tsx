import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Lead, TeamMember, LeadStatus } from '../types';

interface AnalyticsPageProps {
  leads: Lead[];
  team: { sales: TeamMember[]; dealers: TeamMember[] };
}

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-dark">{title}</h2>
        <div className="h-72">
            {children}
        </div>
    </div>
);

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ leads, team }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredLeads = useMemo(() => {
        if (!startDate && !endDate) return leads;
        return leads.filter(lead => {
            const leadDate = new Date(lead.dateAdded);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start && end) return leadDate >= start && leadDate <= end;
            if (start) return leadDate >= start;
            if (end) return leadDate <= end;
            return true;
        });
    }, [leads, startDate, endDate]);

    // Lead Conversion Funnel Data
    const statusCounts = filteredLeads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
    }, {} as Record<LeadStatus, number>);
    const funnelData = [
        { name: 'New', leads: statusCounts.new || 0 },
        { name: 'Contacted', leads: statusCounts.contacted || 0 },
        { name: 'Follow-up', leads: statusCounts['follow-up needed'] || 0 },
        { name: 'Appointment', leads: statusCounts.appointment || 0 },
    ];

    // Communication Effectiveness Data
    const commsTotals = filteredLeads.reduce((acc, lead) => {
        acc.calls += lead.communication.calls;
        acc.sms += lead.communication.sms;
        acc.voicemails += lead.communication.voicemails;
        return acc;
    }, { calls: 0, sms: 0, voicemails: 0 });
    const commsData = [
        { name: 'Calls', value: commsTotals.calls },
        { name: 'SMS', value: commsTotals.sms },
        { name: 'Voicemails', value: commsTotals.voicemails },
    ];
    const commsColors = ['#e63946', '#4caf50', '#ff9e00'];

    // Team Performance Data
    const teamPerformanceData = [
        { name: 'Sales Team', conversions: team.sales.reduce((sum, member) => sum + member.stats.converted, 0) },
        { name: 'Dealers Team', conversions: team.dealers.reduce((sum, member) => sum + member.stats.converted, 0) },
    ];
    
    // Lead Sources Data (Mocked)
    const leadSourcesData = [
        { name: 'Excel Import', value: 65 },
        { name: 'Manual Entry', value: 20 },
        { name: 'Website Form', value: 10 },
        { name: 'Referral', value: 5 },
    ];
    const leadSourcesColors = ['#4361ee', '#ff9e00', '#4caf50', '#9c27b0'];


    return (
        <div>
            <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full md:w-auto">
                        Clear Range
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Lead Conversion Funnel">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="leads" fill="#4361ee" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Communication Effectiveness">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={commsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                {commsData.map((entry, index) => <Cell key={`cell-${index}`} fill={commsColors[index % commsColors.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Team Performance (Conversions)">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={teamPerformanceData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="conversions" fill="#4caf50" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Lead Sources">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={leadSourcesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                            {leadSourcesData.map((entry, index) => <Cell key={`cell-${index}`} fill={leadSourcesColors[index % leadSourcesColors.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

export default AnalyticsPage;