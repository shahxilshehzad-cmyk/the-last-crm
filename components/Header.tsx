
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onSearch }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-light">
      <div className="relative w-full md:w-96 mb-4 md:mb-0">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray"></i>
        <input
          type="text"
          placeholder="Search leads, properties, agents..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white pl-10 pr-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer text-gray-600">
          <i className="fas fa-bell text-xl"></i>
          <div className="absolute -top-1 -right-1 bg-danger text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">3</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
            {currentUser.avatar}
          </div>
          <div>
            <div className="font-semibold">{`${currentUser.firstName} ${currentUser.lastName}`}</div>
            <div className="text-sm text-gray capitalize">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
