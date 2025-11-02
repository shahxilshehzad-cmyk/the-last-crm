
import React from 'react';
import { Lead, User } from '../types';

interface LeadActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    currentUser: User | null;
    onCallClick: (lead: Lead) => void;
    onSmsClick: (lead: Lead) => void;
    onVoicemailClick: (lead: Lead) => void;
    onMapViewClick: (lead: Lead) => void;
    onTransferClick: (lead: Lead) => void;
}

const ActionButton: React.FC<{ icon: string; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-100 rounded-lg hover:bg-primary hover:text-white transition-colors text-center w-full">
        <i className={`fas ${icon} text-3xl`}></i>
        <span className="font-medium">{label}</span>
    </button>
);


const LeadActionModal: React.FC<LeadActionModalProps> = ({ isOpen, onClose, lead, currentUser, onCallClick, onSmsClick, onVoicemailClick, onMapViewClick, onTransferClick }) => {
    if (!isOpen || !lead) return null;

    const canTransfer = currentUser?.role === 'sales';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">Actions for: {lead.agentName}</h2>
                        <p className="text-sm text-gray">{lead.address}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionButton icon="fa-phone-alt" label="Log Call" onClick={() => { onCallClick(lead); onClose(); }} />
                    <ActionButton icon="fa-comment-sms" label="Send SMS" onClick={() => { onSmsClick(lead); onClose(); }} />
                    <ActionButton icon="fa-microphone-alt" label="Leave Voicemail" onClick={() => { onVoicemailClick(lead); onClose(); }} />
                    <ActionButton icon="fa-map-marked-alt" label="Map View" onClick={() => { onMapViewClick(lead); onClose(); }} />
                    {canTransfer && (
                         <ActionButton icon="fa-exchange-alt" label="Transfer Lead" onClick={() => { onTransferClick(lead); onClose(); }} />
                    )}
                </div>
                <div className="p-4 bg-gray-50 text-right rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
                </div>
            </div>
        </div>
    );
};

export default LeadActionModal;