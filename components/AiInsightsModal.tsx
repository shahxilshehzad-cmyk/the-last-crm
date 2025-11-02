import React from 'react';
import { Lead } from '../types';
import { Spinner } from './icons';

interface AiInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    insightText: string;
    isLoading: boolean;
    error: string | null;
}

const AiInsightsModal: React.FC<AiInsightsModalProps> = ({ isOpen, onClose, lead, insightText, isLoading, error }) => {
    if (!isOpen || !lead) return null;
    
    // Renders text with support for **bold** syntax
    const renderInsight = (text: string) => {
        return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                           <i className="fas fa-brain text-primary"></i>
                           AI Insights for: {lead.agentName}
                        </h2>
                        <p className="text-sm text-gray">{lead.address}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {isLoading && !insightText && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner />
                            <p className="mt-4 text-gray-600">Generating insights with Gemini...</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <i className="fas fa-exclamation-triangle text-danger text-4xl mb-4"></i>
                            <p className="font-semibold text-red-700">Failed to generate insights</p>
                            <p className="text-sm text-gray-600 mt-2">{error}</p>
                        </div>
                    )}
                    {insightText && (
                        <div className="text-gray-800 space-y-4 whitespace-pre-wrap">
                             {renderInsight(insightText)}
                             {/* Blinking cursor to show streaming */}
                             {isLoading && <span className="inline-block w-0.5 h-4 bg-gray-800 animate-ping ml-1" style={{ animationDuration: '1.2s' }}></span>}
                        </div>
                    )}
                </div>
                <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
                </div>
            </div>
        </div>
    );
};

export default AiInsightsModal;
