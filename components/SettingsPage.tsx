import React, { useState } from 'react';
import { Spinner } from './icons';

interface SettingsPageProps {
    isCalendarSynced: boolean;
    onCalendarSyncToggle: (isEnabled: boolean) => void;
    showToast: (message: string, type: 'success' | 'info' | 'error') => void;
    onGenerateTemplate: (prompt: string) => Promise<string>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isCalendarSynced, onCalendarSyncToggle, showToast, onGenerateTemplate }) => {

    const [smsTemplate, setSmsTemplate] = useState('');
    const [voicemailTemplate, setVoicemailTemplate] = useState('');
    const [smsAiPrompt, setSmsAiPrompt] = useState('');
    const [voicemailAiPrompt, setVoicemailAiPrompt] = useState('');
    const [isSmsLoading, setIsSmsLoading] = useState(false);
    const [isVoicemailLoading, setIsVoicemailLoading] = useState(false);

    const handleConnectClick = () => {
        showToast('Successfully connected to Google Calendar.', 'success');
    };

    const handleGenerate = async (type: 'sms' | 'voicemail') => {
        if (type === 'sms') {
            if (!smsAiPrompt) {
                showToast('Please enter a prompt for the AI.', 'error');
                return;
            }
            setIsSmsLoading(true);
            const fullPrompt = `Generate a professional SMS template for a roofing company based on this prompt: "${smsAiPrompt}"`;
            const result = await onGenerateTemplate(fullPrompt);
            setSmsTemplate(result);
            setIsSmsLoading(false);
        } else {
            if (!voicemailAiPrompt) {
                showToast('Please enter a prompt for the AI.', 'error');
                return;
            }
            setIsVoicemailLoading(true);
            const fullPrompt = `Generate a professional voicemail script for a roofing company based on this prompt: "${voicemailAiPrompt}"`;
            const result = await onGenerateTemplate(fullPrompt);
            setVoicemailTemplate(result);
            setIsVoicemailLoading(false);
        }
    };
    
    const handleSave = () => {
        // Here you would typically save the smsTemplate and voicemailTemplate to a backend.
        console.log("Saving templates:", { smsTemplate, voicemailTemplate });
        showToast('Settings saved successfully!', 'success');
    };

    return (
        <div>
             <h2 className="text-2xl font-semibold mb-6">Settings</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold mb-4">Google Calendar Integration</h3>
                     <div className="flex items-center">
                        <label htmlFor="googleCalendarToggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="googleCalendarToggle" className="sr-only" checked={isCalendarSynced} onChange={(e) => onCalendarSyncToggle(e.target.checked)} />
                                <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isCalendarSynced ? 'transform translate-x-full bg-primary' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-700 font-medium">
                                Sync communications with Google Calendar
                            </div>
                        </label>
                     </div>
                      {isCalendarSynced && (
                         <div className="mt-6">
                            <button onClick={handleConnectClick} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                                <i className="fab fa-google"></i>
                                Connect Google Calendar
                            </button>
                             <p className="mt-2 text-sm text-gray">
                                 Connect your Google account to automatically sync scheduled communications.
                             </p>
                         </div>
                      )}
                 </div>

                 <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold mb-4">Communication Settings</h3>
                      <div className="space-y-6">
                          <div>
                              <label htmlFor="autoSms" className="block text-sm font-medium text-gray-700 mb-1">Auto-SMS Templates</label>
                              <textarea id="autoSms" rows={4} value={smsTemplate} onChange={e => setSmsTemplate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="Enter your SMS templates here..."></textarea>
                              <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                                  <label htmlFor="smsAiPrompt" className="text-sm font-medium text-gray-600">Need inspiration?</label>
                                  <div className="flex gap-2 mt-1">
                                      <input id="smsAiPrompt" value={smsAiPrompt} onChange={e => setSmsAiPrompt(e.target.value)} type="text" className="flex-grow p-2 border rounded-md" placeholder="e.g., A friendly follow-up..."/>
                                      <button onClick={() => handleGenerate('sms')} disabled={isSmsLoading} className="px-3 py-2 bg-secondary text-white rounded-md hover:bg-primary-dark disabled:bg-opacity-50 flex items-center gap-2">
                                          {isSmsLoading ? <Spinner/> : <i className="fas fa-brain"></i>}
                                          Generate
                                      </button>
                                  </div>
                              </div>
                          </div>
                           <div>
                              <label htmlFor="autoVoicemail" className="block text-sm font-medium text-gray-700 mb-1">Auto-Voicemail Templates</label>
                              <textarea id="autoVoicemail" rows={4} value={voicemailTemplate} onChange={e => setVoicemailTemplate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="Enter your voicemail templates here..."></textarea>
                               <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                                  <label htmlFor="voicemailAiPrompt" className="text-sm font-medium text-gray-600">Need inspiration?</label>
                                  <div className="flex gap-2 mt-1">
                                      <input id="voicemailAiPrompt" value={voicemailAiPrompt} onChange={e => setVoicemailAiPrompt(e.target.value)} type="text" className="flex-grow p-2 border rounded-md" placeholder="e.g., A professional message..."/>
                                      <button onClick={() => handleGenerate('voicemail')} disabled={isVoicemailLoading} className="px-3 py-2 bg-secondary text-white rounded-md hover:bg-primary-dark disabled:bg-opacity-50 flex items-center gap-2">
                                          {isVoicemailLoading ? <Spinner/> : <i className="fas fa-brain"></i>}
                                          Generate
                                      </button>
                                  </div>
                               </div>
                          </div>
                      </div>
                 </div>
             </div>

            <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="bg-success text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Save All Settings
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
