
import React, { useState, useEffect } from 'react';
import { User, TeamMember } from '../types';
import { Spinner } from './icons';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id' | 'avatar'>, id?: number) => void;
    userToEdit?: TeamMember | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'sales' | 'dealers' | 'admin'>('sales');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setFirstName(userToEdit.firstName);
            setLastName(userToEdit.lastName);
            setEmail(userToEdit.email || '');
            setPhone(userToEdit.phone || '');
            setRole(userToEdit.role);
            setUsername(userToEdit.username);
            setPassword('');
        } else {
            // Reset form for new user
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setRole('sales');
            setUsername('');
            setPassword('');
        }
    }, [userToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = { firstName, lastName, email, phone, role, username, password };
        
        // Simulate async operation
        setTimeout(() => {
            onSave(userData, userToEdit?.id);
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                 <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{userToEdit ? 'Edit' : 'Add'} Team Member</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full p-2 border rounded-md">
                                <option value="sales">Sales Team</option>
                                <option value="dealers">Dealers Team</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!userToEdit} className="w-full p-2 border rounded-md" placeholder={userToEdit ? 'Leave blank to keep current password' : ''} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 p-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center gap-2 disabled:opacity-50">
                            {isLoading && <Spinner />}
                            Save Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
