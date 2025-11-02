import React, { useState, useMemo } from 'react';
import { Lead, User } from '../types';
import { PlusIcon } from './icons';

interface LeadsPageProps {
  leads: Lead[];
  currentUser: User;
  onImportClick: () => void;
  onMapViewClick: (lead: Lead) => void;
  onActionClick: (lead: Lead) => void;
  onCallClick: (lead: Lead) => void;
  onCloseJobClick: (lead: Lead) => void;
  onMarkAsLostClick: (lead: Lead) => void;
  onViewJobClick: (lead: Lead) => void;
  onAiInsightClick: (lead: Lead) => void;
}

const LeadsPage: React.FC<LeadsPageProps> = ({ 
    leads, currentUser, onImportClick, onMapViewClick, onActionClick, onCallClick,
    onCloseJobClick, onMarkAsLostClick, onViewJobClick, onAiInsightClick
}) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [inputValue, setInputValue] = useState(''); // For the search input field
    const [searchTerm, setSearchTerm] = useState(''); // For the actual filtering
    const [dateFilter, setDateFilter] = useState('');
    const [roofFlagFilter, setRoofFlagFilter] = useState('all'); // 'all', 'may need roof', 'other'
    const [homeTypeFilter, setHomeTypeFilter] = useState('all');
    const [collapsedAgents, setCollapsedAgents] = useState<string[]>([]);

    const homeTypes = useMemo(() => ['all', ...Array.from(new Set(leads.map(l => l.homeType).filter(Boolean)))], [leads]);

    const myName = `${currentUser.firstName} ${currentUser.lastName}`;
    const isDealer = currentUser.role === 'dealers';
    const isSales = currentUser.role === 'sales';
    
    const initialLeads = useMemo(() => {
        if (isDealer || isSales) {
            return leads.filter(l => l.assignedTo === myName);
        }
        return leads; // For admin
    }, [leads, currentUser, myName, isDealer, isSales]);

    const filteredLeads = initialLeads.filter(lead => {
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        const searchTermDigitsOnly = searchTerm.replace(/\D/g, '');

        const matchesSearch = searchTerm === '' || 
            lead.agentName.toLowerCase().includes(lowerSearchTerm) ||
            lead.address.toLowerCase().includes(lowerSearchTerm) ||
            (searchTermDigitsOnly.length > 0 && 
                (lead.agentPhone || '').replace(/\D/g, '').includes(searchTermDigitsOnly)
            );
            
        const matchesDate = !dateFilter || lead.dateAdded === dateFilter;

        const matchesRoofFlag = roofFlagFilter === 'all' ||
            (roofFlagFilter === 'may need roof' && lead.roofFlag?.toLowerCase() === 'may need roof') ||
            (roofFlagFilter === 'other' && lead.roofFlag && lead.roofFlag.toLowerCase() !== 'may need roof');

        const matchesHomeType = homeTypeFilter === 'all' || lead.homeType === homeTypeFilter;

        return matchesStatus && matchesSearch && matchesDate && matchesRoofFlag && matchesHomeType;
    });
    
    const groupedLeads = useMemo(() => {
        if (isDealer) { // Dealers don't need grouping
            return { 'My Leads': filteredLeads };
        }
        return filteredLeads.reduce((acc, lead) => {
            const agentName = lead.agentName;
            if (!acc[agentName]) {
                acc[agentName] = [];
            }
            acc[agentName].push(lead);
            return acc;
        }, {} as Record<string, Lead[]>);
    }, [filteredLeads, isDealer]);

    const toggleAgentCollapse = (agentName: string) => {
        setCollapsedAgents(prev => 
            prev.includes(agentName) ? prev.filter(name => name !== agentName) : [...prev, agentName]
        );
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(inputValue);
    };

    const clearSearch = () => {
        setInputValue('');
        setSearchTerm('');
    };

    const statusFilters = isDealer ? ['all', 'appointment', 'closed job', 'lost job'] : ['all', 'new', 'contacted', 'follow-up needed', 'rejected', 'appointment', 'closed job', 'lost job'];
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                         <input 
                            type="text" 
                            placeholder="Search by agent, address, or phone..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full md:w-64 p-2 pl-10 border border-gray-300 rounded-lg"
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        {inputValue && (
                            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                                <i className="fas fa-times-circle"></i>
                            </button>
                        )}
                    </div>
                     <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                        Search
                    </button>
                </form>

                {!isDealer && !isSales && (
                    <button onClick={onImportClick} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
                        <PlusIcon />
                        Import Leads
                    </button>
                )}
            </div>
            
            {!isDealer && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Uploaded</label>
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roof Flag</label>
                        <select value={roofFlagFilter} onChange={e => setRoofFlagFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg capitalize">
                            <option value="all">All</option>
                            <option value="may need roof">May Need Roof</option>
                            <option value="other">Other Flags</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Type</label>
                        <select value={homeTypeFilter} onChange={e => setHomeTypeFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                            {homeTypes.map(type => <option key={type} value={type} className="capitalize">{type}</option>)}
                        </select>
                    </div>
                </div>
            )}
            
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {statusFilters.map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize ${statusFilter === status ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            {status}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase">
                        {isDealer ? (
                             <tr>
                                <th className="p-3">Agent Name</th>
                                <th className="p-3">Address</th>
                                <th className="p-3">Listing Link</th>
                                <th className="p-3">Home Type</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Revenue</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        ) : (
                             <tr>
                                <th className="p-3">Agent Name / Listing Link</th>
                                <th className="p-3">Roof Flag</th>
                                <th className="p-3">Home Type</th>
                                <th className="p-3">Assigned To</th>
                                <th className="p-3">Date Added</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {Object.entries(groupedLeads).length > 0 ? Object.entries(groupedLeads).map(([agentName, agentLeads]) => {
                            const isCollapsed = collapsedAgents.includes(agentName);
                            if (isDealer) { // Dealers see a flat list
                                return agentLeads.map(lead => (
                                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark">{lead.agentName}</td>
                                        <td className="p-3">{lead.address}</td>
                                        <td className="p-3"><a href={lead.listingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">View Listing</a></td>
                                        <td className="p-3">{lead.homeType}</td>
                                        <td className="p-3">
                                            <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${ lead.status === 'appointment' ? 'bg-blue-100 text-blue-800' : lead.status === 'closed job' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>{lead.status}</span>
                                        </td>
                                        <td className="p-3 font-medium text-green-700">
                                            {lead.jobRevenue ? `$${lead.jobRevenue.toLocaleString()}` : <span className="text-gray-400">N/A</span>}
                                        </td>
                                        <td className="p-3 text-center whitespace-nowrap">
                                            <a href={lead.agentPhone ? `tel:${lead.agentPhone}` : undefined} onClick={(e) => { if (!lead.agentPhone) e.preventDefault(); onCallClick(lead); }} className="text-green-600 hover:text-green-800 p-1 rounded-md" title={lead.status === 'appointment' ? 'Update Job Status' : 'Log a Call'}><i className="fas fa-phone-alt"></i></a>
                                            <button onClick={() => onMapViewClick(lead)} className="text-primary hover:text-secondary p-1 rounded-md ml-2" title="Map View"><i className="fas fa-map-marked-alt"></i></button>
                                            {lead.status === 'closed job' && (<button onClick={() => onViewJobClick(lead)} className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-secondary ml-2">View Details</button>)}
                                        </td>
                                    </tr>
                                ))
                            }
                            return (
                                <React.Fragment key={agentName}>
                                    <tr className="bg-gray-100 border-b border-gray-300 cursor-pointer" onClick={() => toggleAgentCollapse(agentName)}>
                                        <td colSpan={7} className="p-3 font-bold text-dark">
                                            <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'down'} mr-3 transition-transform`}></i>
                                            {agentName}
                                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gray-300 rounded-full">{agentLeads.length}</span>
                                        </td>
                                    </tr>
                                    {!isCollapsed && agentLeads.map(lead => (
                                        <tr key={lead.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium text-dark"><a href={lead.listingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">View Listing</a></td>
                                            <td className="p-3">
                                                {lead.roofFlag ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize truncate" title={lead.roofFlag}>{lead.roofFlag}</span> : <span className="text-gray-500">None</span>}
                                            </td>
                                            <td className="p-3">{lead.homeType}</td>
                                            <td className="p-3">{lead.assignedTo}</td>
                                            <td className="p-3">{lead.dateAdded}</td>
                                            <td className="p-3">
                                                <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${
                                                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                                                    lead.status === 'follow-up needed' ? 'bg-yellow-100 text-yellow-800' :
                                                    lead.status === 'appointment' ? 'bg-indigo-100 text-indigo-800' :
                                                    lead.status === 'closed job' ? 'bg-green-100 text-green-800' :
                                                    lead.status === 'lost job' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>{lead.status}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {(currentUser.role === 'admin' && (lead.status === 'closed job' || lead.status === 'lost job')) && (
                                                    <button onClick={() => onViewJobClick(lead)} className="text-gray-600 hover:text-gray-800 p-1 rounded-md" title="View Job Details"><i className="fas fa-eye"></i></button>
                                                )}
                                                <button onClick={() => onAiInsightClick(lead)} className="text-purple-600 hover:text-purple-800 p-1 rounded-md ml-2" title="AI Insights"><i className="fas fa-brain"></i></button>
                                                <a href={lead.agentPhone ? `tel:${lead.agentPhone}` : undefined} onClick={(e) => { if (!lead.agentPhone) e.preventDefault(); onCallClick(lead); }} className="text-green-600 hover:text-green-800 p-1 rounded-md ml-2" title="Log a Call"><i className="fas fa-phone-alt"></i></a>
                                                <button onClick={() => onActionClick(lead)} className="text-primary hover:text-secondary p-1 rounded-md ml-2" title="More Actions"><i className="fas fa-bolt"></i></button>
                                                <button onClick={() => onMapViewClick(lead)} className="text-primary hover:text-secondary p-1 rounded-md ml-2" title="Map View"><i className="fas fa-map-marked-alt"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        }) : (
                             <tr>
                                <td colSpan={isDealer ? 7 : 7} className="text-center p-8 text-gray-500">No leads found with current filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadsPage;