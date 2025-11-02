import React, { useState, useEffect, useMemo } from 'react';
import { Lead, User, TeamMember } from '../types';
import { Spinner } from './icons';

type SalesDisposition = 'connected' | 'no_answer' | 'voicemail' | 'wrong_number' | 'not_interested' | 'transfer';
type DealerDisposition = 'closed' | 'lost';
type Disposition = SalesDisposition | DealerDisposition;

interface CallSaveData {
    leadId: number;
    disposition: Disposition;
    notes: string;
    transferDetails?: {
        dealerId: string;
        date: string;
        time: string;
    };
    jobRevenue?: number;
}

interface CallDispositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CallSaveData) => void;
    lead: Lead | null;
    currentUser: User | null;
    dealers: TeamMember[];
}


const CallDispositionModal: React.FC<CallDispositionModalProps> = ({ isOpen, onClose, onSave, lead, currentUser, dealers }) => {
    const [disposition, setDisposition] = useState<Disposition>('connected');
    const [notes, setNotes] = useState('');
    const [selectedDealerId, setSelectedDealerId] = useState<string>('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [revenue, setRevenue] = useState<number | ''>('');
    
    const isDealer = currentUser?.role === 'dealers';

    const dispositionOptions = useMemo(() => {
        if (isDealer) {
            return [
                { value: 'closed', label: 'Job Closed' },
                { value: 'lost', label: 'Job Lost' },
            ];
        }
        // Salesperson options
        const baseOptions: { value: SalesDisposition; label: string }[] = [
            { value: 'connected', label: 'Connected' },
            { value: 'no_answer', label: 'No Answer' },
            { value: 'voicemail', label: 'Left Voicemail' },
            { value: 'wrong_number', label: 'Wrong Number' },
            { value: 'not_interested', label: 'Not Interested' },
        ];
        baseOptions.push({ value: 'transfer', label: 'Transfer to Dealer' });
        return baseOptions;
    }, [isDealer]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state fully on close
            setNotes('');
            setSelectedDealerId('');
            setAppointmentDate('');
            setAppointmentTime('');
            setRevenue('');
            setIsLoading(false);
        } else {
             // Set initial disposition based on role
            setDisposition(isDealer ? 'closed' : 'connected');
            // Pre-select first dealer if available for sales
            if (!isDealer && dealers.length > 0) {
                setSelectedDealerId(String(dealers[0].id));
            }
        }
    }, [isOpen, isDealer, dealers]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead) return;
        
        const saveData: CallSaveData = {
            leadId: lead.id,
            disposition,
            notes,
        };
        
        if (isDealer) {
            if (disposition === 'closed') {
                if (!revenue) {
                    alert('Please enter the job revenue.');
                    return;
                }
                saveData.jobRevenue = Number(revenue);
            }
        } else { // Salesperson logic
            if (disposition === 'transfer') {
                if (!selectedDealerId || !appointmentDate || !appointmentTime) {
                    alert('Please select a dealer, date, and time for the transfer.');
                    return;
                }
                saveData.transferDetails = {
                    dealerId: selectedDealerId,
                    date: appointmentDate,
                    time: appointmentTime,
                };
            }
        }
        
        setIsLoading(true);
        setTimeout(() => {
            onSave(saveData);
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    if (!isOpen || !lead || !currentUser) return null;

    const title = isDealer ? 'Update Job Outcome' : `Log Call for: ${lead.agentName}`;
    const isTransferSelected = !isDealer && disposition === 'transfer';
    const isJobClosedSelected = isDealer && disposition === 'closed';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                 <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-gray">{lead.address}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{isDealer ? 'Outcome' : 'Call Outcome'}</label>
                            <select value={disposition} onChange={e => setDisposition(e.target.value as Disposition)} required className="w-full p-2 border rounded-md">
                                {dispositionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>

                        {isJobClosedSelected && (
                             <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                                <label className="block text-sm font-medium mb-1">Job Revenue ($)</label>
                                <input 
                                    type="number" 
                                    value={revenue} 
                                    onChange={e => setRevenue(Number(e.target.value))} 
                                    required 
                                    className="w-full p-2 border rounded-md" 
                                    placeholder="e.g. 15000"
                                />
                            </div>
                        )}

                        {isTransferSelected && (
                            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-4">
                                <h3 className="font-semibold text-blue-800">Schedule Appointment</h3>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Assign to Dealer</label>
                                    <select value={selectedDealerId} onChange={e => setSelectedDealerId(e.target.value)} required className="w-full p-2 border rounded-md">
                                        {dealers.map(dealer => <option key={dealer.id} value={dealer.id}>{dealer.firstName} {dealer.lastName}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date</label>
                                        <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required className="w-full p-2 border rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Time</label>
                                        <input type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} required className="w-full p-2 border rounded-md" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-2 border rounded-md" placeholder="Add relevant notes..."></textarea>
                        </div>
                    </div>
                     <div className="flex justify-end gap-4 p-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center gap-2 disabled:opacity-50">
                            {isLoading && <Spinner />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CallDispositionModal;