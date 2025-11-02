
import React, { useState, useEffect } from 'react';
import { Lead, CommunicationEvent, CommunicationType } from '../types';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CommunicationEvent, 'id'>) => void;
    leads: Lead[];
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, leads }) => {
    const [leadId, setLeadId] = useState<number | ''>('');
    const [type, setType] = useState<CommunicationType>('call');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setLeadId('');
            setType('call');
            setDate('');
            setTime('');
            setNotes('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadId || !date || !time) return;

        onSave({ leadId: Number(leadId), type, date, time, notes });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">Schedule Communication</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Lead</label>
                            <select value={leadId} onChange={e => setLeadId(Number(e.target.value))} required className="w-full p-2 border rounded-md">
                                <option value="" disabled>Select a lead</option>
                                {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.agentName} - {lead.address}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Communication Type</label>
                            <select value={type} onChange={e => setType(e.target.value as CommunicationType)} className="w-full p-2 border rounded-md">
                                <option value="call">Call</option>
                                <option value="sms">SMS</option>
                                <option value="voicemail">Voicemail</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Time</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded-md"></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 p-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">Save Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleModal;
