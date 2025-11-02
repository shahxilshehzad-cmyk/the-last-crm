import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Lead, User } from '../types';
import { Spinner } from './icons';

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (leadId: number, revenue: number, photos: string[]) => void;
    lead: Lead | null;
    currentUser: User | null;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, onSave, lead, currentUser }) => {
    const [revenue, setRevenue] = useState<number | ''>('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [newlyUploaded, setNewlyUploaded] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const isReadOnly = lead?.status === 'closed job' && currentUser?.role === 'admin';
    const isDealerView = lead?.status === 'closed job' && currentUser?.role === 'dealers';

    useEffect(() => {
        if (isOpen && lead) {
            setRevenue(lead.jobRevenue || '');
            setPhotos(lead.jobPhotos || []);
            setNewlyUploaded([]);
        } else if (!isOpen) {
            setRevenue('');
            setPhotos([]);
            setNewlyUploaded([]);
            setIsLoading(false);
        }
    }, [isOpen, lead]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setNewlyUploaded(prev => [...prev, base64]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead || (!revenue && lead.status !== 'closed job')) return;

        setIsLoading(true);
        // Simulate async save
        setTimeout(() => {
            const finalRevenue = typeof revenue === 'number' ? revenue : lead.jobRevenue || 0;
            onSave(lead.id, finalRevenue, newlyUploaded);
            setIsLoading(false);
            onClose();
        }, 1500);
    };
    
    const removeNewPhoto = (index: number) => {
        setNewlyUploaded(prev => prev.filter((_, i) => i !== index));
    };

    if (!isOpen || !lead || !currentUser) return null;
    
    const title = lead.status === 'appointment' ? 'Close Job & Add Details' : 'Job Details';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                 <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{lead.agentName} - {lead.address}</p>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-6">
                         <div>
                            <label className="block text-sm font-medium mb-1">Job Revenue ($)</label>
                            <input 
                                type="number" 
                                value={revenue} 
                                onChange={e => setRevenue(Number(e.target.value))} 
                                required={lead.status !== 'closed job'}
                                readOnly={isReadOnly || isDealerView}
                                className="w-full p-2 border rounded-md read-only:bg-gray-100"
                                placeholder="e.g., 15000"
                            />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1">Job Photos</label>
                           {photos.length > 0 && (
                               <div className="grid grid-cols-3 gap-2 mb-4">
                                   {photos.map((photo, index) => (
                                       <img key={index} src={photo} alt={`Job Photo ${index + 1}`} className="w-full h-24 object-cover rounded"/>
                                   ))}
                               </div>
                           )}
                           {(!isReadOnly || isDealerView) && (
                                <>
                                 <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}`}>
                                    <input {...getInputProps()} />
                                    <i className="fas fa-camera text-3xl text-gray-400 mb-2"></i>
                                    <p className="text-gray-600">Drag & drop photos here, or click to select.</p>
                                </div>
                                {newlyUploaded.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm">New Photos to Upload:</h4>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {newlyUploaded.map((photo, index) => (
                                                <div key={index} className="relative">
                                                    <img src={photo} alt={`New Photo ${index + 1}`} className="w-full h-24 object-cover rounded"/>
                                                    <button type="button" onClick={() => removeNewPhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </>
                           )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 p-4 border-t bg-gray-50 rounded-b-lg sticky bottom-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                            {lead.status === 'closed job' ? 'Close' : 'Cancel'}
                        </button>
                        {lead.status === 'appointment' && (
                             <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center gap-2 disabled:opacity-50">
                                {isLoading && <Spinner />}
                                Save & Close Job
                            </button>
                        )}
                         {isDealerView && newlyUploaded.length > 0 && (
                             <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center gap-2 disabled:opacity-50">
                                {isLoading && <Spinner />}
                                Upload More Photos
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobDetailsModal;
