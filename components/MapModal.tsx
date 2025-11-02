import React from 'react';
import { Lead } from '../types';
import { Spinner } from './icons';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    mapUri: string | null;
    isLoading: boolean;
    error: string | null;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, lead, mapUri, isLoading, error }) => {

    if (!isOpen || !lead) return null;

    const title = `Satellite View: ${lead.address}, ${lead.city}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-light">
                    <h2 className="text-xl font-semibold text-dark">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-2 flex-grow relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
                            <Spinner />
                            <p className="mt-4 text-gray-600">Fetching satellite imagery...</p>
                        </div>
                    )}
                    {error && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4">
                            <i className="fas fa-exclamation-triangle text-danger text-4xl mb-4"></i>
                            <p className="text-center text-red-700">{error}</p>
                            <p className="text-center text-sm text-gray-500 mt-2">Please ensure you've granted location permissions and the address is correct.</p>
                        </div>
                    )}
                    {mapUri && (
                        <iframe
                            title="Property Satellite View"
                            className="w-full h-full border-0 rounded-b-lg"
                            loading="lazy"
                            allowFullScreen
                            src={mapUri}>
                        </iframe>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapModal;