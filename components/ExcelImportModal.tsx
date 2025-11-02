import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { read, utils } from 'xlsx';
import { Lead, TeamMember } from '../types';
import { Spinner } from './icons';

interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (leads: Omit<Lead, 'id' | 'assignedTo' | 'dateAdded' | 'communication' | 'status'>[], assignedToName: string) => void;
    salesTeam: TeamMember[];
}

type Step = 'upload' | 'map' | 'preview';

// FIX: Constrained the `key` property to only include string keys from the Lead type. This resolves multiple TypeScript errors.
const CRM_FIELDS: { key: Extract<keyof Lead, string>; label: string; required: boolean; examples: string[] }[] = [
    { key: 'listingLink', label: 'Listing Link', required: false, examples: ['url', 'link', 'listing'] },
    { key: 'agentName', label: 'Agent Name', required: false, examples: ['agent', 'agent name'] },
    { key: 'agentEmail', label: 'Agent Email', required: false, examples: ['email'] },
    { key: 'agentPhone', label: 'Agent Phone', required: false, examples: ['phone', 'contact'] },
    { key: 'address', label: 'Street Address', required: false, examples: ['address', 'street'] },
    { key: 'city', label: 'City', required: false, examples: ['city'] },
    { key: 'zipCode', label: 'Postal Code', required: false, examples: ['zip', 'postal'] },
    { key: 'homeType', label: 'Home Type', required: false, examples: ['type', 'home type'] },
    { key: 'homeValue', label: 'Home Value', required: false, examples: ['value', 'price', 'amount'] },
    { key: 'roofFlag', label: 'Roof Flag', required: false, examples: ['roof', 'flag'] },
    { key: 'lastSoldDate', label: 'Last Sold Date', required: false, examples: ['sold', 'last sold'] },
    { key: 'permits', label: 'Permits', required: false, examples: ['permit'] },
];


const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, onImport, salesTeam }) => {
    const [step, setStep] = useState<Step>('upload');
    const [activeTab, setActiveTab] = useState<'upload' | 'google'>('upload');
    const [rows, setRows] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [assignedToId, setAssignedToId] = useState<string>('Unassigned');

    const resetState = () => {
        setStep('upload');
        setRows([]);
        setHeaders([]);
        setMappings({});
        setIsLoading(false);
        setError('');
        setAssignedToId('Unassigned');
    };
    
    useEffect(() => {
        if (isOpen) {
            resetState();
        }
    }, [isOpen]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        
        setIsLoading(true);
        setError('');
        
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                if (!data) throw new Error("Could not read file data.");

                const workbook = read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = utils.sheet_to_json<any>(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    throw new Error("File is empty or contains only a header row.");
                }

                const fileHeaders = jsonData[0] as string[];
                const fileRows = jsonData.slice(1);
                
                setHeaders(fileHeaders);
                setRows(fileRows);
                
                // Auto-detect mappings
                const initialMappings: Record<string, string> = {};
                CRM_FIELDS.forEach(field => {
                    const headerLower = fileHeaders.map(h => h.toLowerCase());
                    const foundHeader = fileHeaders.find(h => 
                        field.examples.some(ex => h.toLowerCase().includes(ex))
                    );
                    if (foundHeader) {
                        initialMappings[field.key] = foundHeader;
                    }
                });
                setMappings(initialMappings);
                
                setStep('map');
            } catch (e: any) {
                setError(e.message || "Failed to parse the file. Please ensure it's a valid Excel or CSV file.");
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setError("Error reading the file.");
            setIsLoading(false);
        };

        reader.readAsArrayBuffer(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'], 'text/csv': ['.csv'] } });
    
    const isMappingValid = useMemo(() => {
        // Now always valid as no fields are required for import
        return true;
    }, [mappings]);

    const processedLeads = useMemo(() => {
        return rows.map(row => {
            const lead: any = {};
            CRM_FIELDS.forEach(field => {
                const header = mappings[field.key];
                if (header) {
                    const headerIndex = headers.indexOf(header);
                    const value = row[headerIndex];
                    lead[field.key] = value !== undefined && value !== null ? String(value) : '';
                } else {
                    lead[field.key] = ''; // Default for unmapped fields
                }
            });
            return { data: lead };
        }).filter(item => {
            // We can add a light filter here to remove completely empty rows
            return Object.values(item.data).some(val => val !== '' && val !== false);
        });
    }, [mappings, headers, rows]);


    const handleImport = () => {
        const leadsToImport = processedLeads.map(item => item.data);
        const selectedMember = salesTeam.find(m => m.id.toString() === assignedToId);
        const assignedToName = selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : 'Unassigned';
        onImport(leadsToImport, assignedToName);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">Import Leads</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div>
                             <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('upload')} className={`${activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Upload File</button>
                                    <button onClick={() => setActiveTab('google')} className={`${activeTab === 'google' ? 'border-primary text-primary' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Import from Google Sheets</button>
                                </nav>
                            </div>
                            {activeTab === 'upload' && (
                                <div {...getRootProps()} className={`mt-6 border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}`}>
                                    <input {...getInputProps()} />
                                    {isLoading ? (
                                        <div className="flex flex-col items-center"><Spinner /><p className="mt-2 text-gray-600">Parsing file...</p></div>
                                    ) : (
                                        <div>
                                            <i className="fas fa-file-upload text-4xl text-gray-400 mb-4"></i>
                                            <p className="text-gray-600">Drag & drop your file here, or click to select a file.</p>
                                            <p className="text-xs text-gray-500 mt-2">(Supported formats: .xlsx, .xls, .csv)</p>
                                        </div>
                                    )}
                                </div>
                            )}
                             {activeTab === 'google' && (
                                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-2">Instructions</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                        <li>Open your spreadsheet in Google Sheets.</li>
                                        <li>Go to <span className="font-semibold">File</span> &gt; <span className="font-semibold">Download</span> &gt; <span className="font-semibold">Microsoft Excel (.xlsx)</span>.</li>
                                        <li>Switch back to the "Upload File" tab here.</li>
                                        <li>Drag and drop or click to upload the downloaded file.</li>
                                    </ol>
                                </div>
                            )}
                             {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">{error}</div>}
                        </div>
                    )}

                    {/* Step 2: Map Columns */}
                    {step === 'map' && (
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Map Your Columns</h3>
                            <p className="text-sm text-gray-600 mb-4">Match the columns from your file to the fields in the CRM. The better the match, the better the data.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[50vh] overflow-y-auto pr-2">
                                {CRM_FIELDS.map(field => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium mb-1">
                                            {field.label}
                                        </label>
                                        <select value={mappings[field.key] || ''} onChange={e => setMappings(prev => ({ ...prev, [field.key]: e.target.value }))} className="w-full p-2 border rounded-md">
                                            <option value="">Select a column...</option>
                                            {headers.map(header => <option key={header} value={header}>{header}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Step 3: Preview */}
                    {step === 'preview' && (
                         <div>
                            <h3 className="font-semibold text-lg mb-2">Preview & Confirm</h3>
                            <div className="p-4 bg-blue-50 rounded-md mb-4 flex justify-between items-center">
                                <p className="font-medium">{processedLeads.length} leads will be imported.</p>
                                 <div className="flex items-center gap-2">
                                    <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700">Assign To:</label>
                                    <select 
                                        id="assignTo" 
                                        value={assignedToId} 
                                        onChange={e => setAssignedToId(e.target.value)}
                                        className="w-48 p-2 text-sm border-gray-300 rounded-md shadow-sm"
                                    >
                                        <option value="Unassigned">Unassigned</option>
                                        {salesTeam.map(member => (
                                            <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                             <div className="overflow-auto max-h-64 border rounded-lg">
                                 <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            {CRM_FIELDS.filter(f => mappings[f.key]).map(field => <th key={field.key} className="p-2 text-left font-medium">{field.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                         {processedLeads.slice(0, 5).map((item, i) => (
                                            <tr key={i} className="border-t">
                                                {CRM_FIELDS.filter(f => mappings[f.key]).map(field => <td key={field.key} className="p-2 truncate">{String(item.data[field.key])}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center gap-4 p-4 border-t">
                    <div>
                        {step !== 'upload' && <button onClick={() => setStep(step === 'map' ? 'upload' : 'map')} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Back</button>}
                    </div>
                    <div className="flex gap-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        {step === 'map' && <button onClick={() => setStep('preview')} disabled={!isMappingValid} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50">Next: Preview</button>}
                        {step === 'preview' && <button onClick={handleImport} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Confirm & Import</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExcelImportModal;