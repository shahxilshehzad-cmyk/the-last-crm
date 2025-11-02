
import React from 'react';

type Page = 'dashboard' | 'leads' | 'analytics' | 'calendar' | 'team' | 'settings';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${isActive ? 'bg-secondary text-white' : 'text-gray-200 hover:bg-primary-dark'}`}>
        <i className={`fas ${icon} w-6 text-center`}></i>
        <span className="ml-4 font-medium">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout }) => {
    return (
        <aside className="bg-primary text-white w-64 min-h-screen flex flex-col justify-between p-4">
            <div>
                 <div className="flex items-center gap-2 mb-10 px-2">
                     <i className="fas fa-hands-helping text-success text-3xl"></i>
                     <h1 className="text-2xl font-bold">White Glove</h1>
                </div>
                <nav className="space-y-2">
                    <NavItem icon="fa-tachometer-alt" label="Dashboard" isActive={activePage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                    <NavItem icon="fa-users" label="Leads" isActive={activePage === 'leads'} onClick={() => onNavigate('leads')} />
                    <NavItem icon="fa-chart-pie" label="Analytics" isActive={activePage === 'analytics'} onClick={() => onNavigate('analytics')} />
                    <NavItem icon="fa-calendar-alt" label="Calendar" isActive={activePage === 'calendar'} onClick={() => onNavigate('calendar')} />
                    <NavItem icon="fa-sitemap" label="Team" isActive={activePage === 'team'} onClick={() => onNavigate('team')} />
                    <NavItem icon="fa-cog" label="Settings" isActive={activePage === 'settings'} onClick={() => onNavigate('settings')} />
                </nav>
            </div>
             <div>
                <NavItem icon="fa-sign-out-alt" label="Logout" isActive={false} onClick={onLogout} />
            </div>
        </aside>
    );
};

export default Sidebar;
