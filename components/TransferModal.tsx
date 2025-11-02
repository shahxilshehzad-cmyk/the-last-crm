import React, { useState, useEffect } from 'react';
import { Lead, TeamMember } from '../types';
import { Spinner } from './icons';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (leadId: number, dealerName: string, date: string, time: string) => void;
    lead: Lead | null;
    dealers: TeamMember[];
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSave, lead, dealers }) => {
    const [selectedDealerId, setSelectedDealerId] = useState<string>('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dealerSearch, setDealerSearch] = useState('');

    const filteredDealers = dealers.filter(dealer => 
        `${dealer.firstName} ${dealer.lastName}`.toLowerCase().includes(dealerSearch.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            if (dealers.length > 0) {
                // Set initial selection only if it's not already set
                if(!selectedDealerId) {
                    setSelectedDealerId(dealers[0].id.toString());
                }
            }
        } else {
            // Reset state on close
            setSelectedDealerId('');
            setAppointmentDate('');
            setAppointmentTime('');
            setDealerSearch('');
            setIsLoading(false);
        }
    }, [isOpen, dealers]);

    useEffect(() => {
        // Update selection if filtered list changes
        if (filteredDealers.length > 0) {
            const isSelectedVisible = filteredDealers.some(d => d.id.toString() === selectedDealerId);
            if (!isSelectedVisible) {
                setSelectedDealerId(filteredDealers[0].id.toString());
            }
        } else {
            setSelectedDealerId('');
        }
    }, [dealerSearch, dealers]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead || !selectedDealerId || !appointmentDate || !appointmentTime) return;

        const dealer = dealers.find(d => d.id.toString() === selectedDealerId);
        if (!dealer) return;

        setIsLoading(true);
        // Simulate async operation
        setTimeout(() => {
            const dealerName = `${dealer.firstName} ${dealer.lastName}`;
            onSave(lead.id, dealerName, appointmentDate, appointmentTime);
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                 <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Transfer Lead to Dealer</h2>
                    <p className="text-sm text-gray-500 mt-1">Schedule an appointment for the dealer with: {lead.agentName}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                         <div>
                            <label className="block text-sm font-medium mb-1">Search & Select Dealer</label>
                            {dealers.length > 0 ? (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Search dealers by name..."
                                        value={dealerSearch}
                                        onChange={e => setDealerSearch(e.target.value)}
                                        className="w-full p-2 border rounded-md mb-2"
                                    />
                                    <select value={selectedDealerId} onChange={e => setSelectedDealerId(e.target.value)} required className="w-full p-2 border rounded-md">
                                        {filteredDealers.map(dealer => (
                                            <option key={dealer.id} value={dealer.id}>
                                                {dealer.firstName} {dealer.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {filteredDealers.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-2">No dealers match your search.</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-600 bg-gray-100 p-3 rounded-md">No dealers available to assign.</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium mb-1">Appointment Date</label>
                                <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Appointment Time</label>
                                <input type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end gap-4 p-4 border-t bg-gray-50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading || dealers.length === 0 || !selectedDealerId} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center gap-2 disabled:opacity-50">
                            {isLoading && <Spinner />}
                            Confirm & Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;