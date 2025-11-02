
import React, { useState } from 'react';
import { TeamMember, TeamType } from '../types';

interface TeamPageProps {
  team: {
    sales: TeamMember[];
    dealers: TeamMember[];
    admin: TeamMember[];
  };
  onAddUserClick: () => void;
  onEditUser: (user: TeamMember) => void;
  onDeleteUser: (userId: number, team: TeamType) => void;
}

const TeamPage: React.FC<TeamPageProps> = ({ team, onAddUserClick, onEditUser, onDeleteUser }) => {
    const [activeTab, setActiveTab] = useState<TeamType>('sales');

    const activeTeamMembers = team[activeTab];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Team Management</h2>
                <button onClick={onAddUserClick} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                    <i className="fas fa-plus"></i>
                    Add Team Member
                </button>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['sales', 'dealers', 'admin'] as TeamType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab} Team
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTeamMembers.map(member => (
                    <div key={member.id} className="border border-gray-light rounded-lg p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl">
                                {member.avatar}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{`${member.firstName} ${member.lastName}`}</h3>
                                <p className="text-sm text-gray">{member.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center my-4">
                            <div className="bg-light p-2 rounded">
                                <span className="font-bold text-lg block">{member.stats.leads}</span>
                                <span className="text-xs text-gray">Leads</span>
                            </div>
                            <div className="bg-light p-2 rounded">
                                <span className="font-bold text-lg block">{member.stats.contacted}</span>
                                <span className="text-xs text-gray">Contacted</span>
                            </div>
                            <div className="bg-light p-2 rounded">
                                <span className="font-bold text-lg block">{member.stats.converted}</span>
                                <span className="text-xs text-gray">Converted</span>
                            </div>
                        </div>
                         <div className="flex items-center justify-end gap-2 mt-4">
                            <button onClick={() => onEditUser(member)} className="text-sm text-primary hover:text-secondary p-2 rounded-md"><i className="fas fa-edit"></i> Edit</button>
                            <button onClick={() => onDeleteUser(member.id, activeTab)} className="text-sm text-danger hover:text-red-700 p-2 rounded-md"><i className="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                ))}
                 {activeTeamMembers.length === 0 && <p className="col-span-full text-center py-8 text-gray">No members in this team.</p>}
            </div>
        </div>
    );
};

export default TeamPage;
