import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Lead, TeamMember, User, Toast, CommunicationEvent, TeamType } from './types';
import { USERS, TEAM_MEMBERS, LEADS, COMMUNICATION_EVENTS } from './constants';

import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './components/DashboardPage';
import LeadsPage from './components/LeadsPage';
import AnalyticsPage from './components/AnalyticsPage';
import CalendarPage from './components/CalendarPage';
import TeamPage from './components/TeamPage';
import SettingsPage from './components/SettingsPage';
import { ToastContainer } from './components/Toast';
import ExcelImportModal from './components/ExcelImportModal';
import MapModal from './components/MapModal';
import UserModal from './components/UserModal';
import ScheduleModal from './components/ScheduleModal';
import LeadActionModal from './components/LeadActionModal';
import CallDispositionModal from './components/CallDispositionModal';
import TransferModal from './components/TransferModal';
import JobDetailsModal from './components/JobDetailsModal';
import AiInsightsModal from './components/AiInsightsModal';

// --- API KEYS ---
// TODO: Replace these placeholders with your actual API keys.
// See README.md for instructions on how to get these keys.
const GEMINI_API_KEY = process.env.API_KEY;
const MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';


type Page = 'dashboard' | 'leads' | 'analytics' | 'calendar' | 'team' | 'settings';

interface CallSaveData {
    leadId: number;
    disposition: string; // Generic disposition now
    notes: string;
    transferDetails?: {
        dealerId: string;
        date: string;
        time: string;
    };
    jobRevenue?: number;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isLeadActionModalOpen, setLeadActionModalOpen] = useState(false);
  const [isCallDispositionModalOpen, setCallDispositionModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [isJobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  
  const [selectedLeadForMap, setSelectedLeadForMap] = useState<Lead | null>(null);
  const [mapUri, setMapUri] = useState<string | null>(null);
  const [isMapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<TeamMember | null>(null);
  const [selectedLeadForAction, setSelectedLeadForAction] = useState<Lead | null>(null);
  
  const [aiInsight, setAiInsight] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [team, setTeam] = useState(TEAM_MEMBERS);
  const [communications, setCommunications] = useState<CommunicationEvent[]>(COMMUNICATION_EVENTS);
  const [isCalendarSynced, setIsCalendarSynced] = useState(false);


  // --- Gemini API ---
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  useEffect(() => {
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      setAi(new GoogleGenAI({ apiKey: GEMINI_API_KEY }));
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const newToast: Toast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
  };
  
  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.firstName}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard');
    showToast('You have been logged out.', 'info');
  };

  const handleImportLeads = (newLeads: Omit<Lead, 'id' | 'assignedTo' | 'dateAdded' | 'communication' | 'status'>[], assignedToName: string) => {
      const formattedLeads: Lead[] = newLeads.map((lead, index) => ({
          ...lead,
          id: leads.length + index + 1,
          assignedTo: assignedToName,
          dateAdded: new Date().toISOString().split('T')[0],
          communication: { calls: 0, sms: 0, voicemails: 0, notes: [] },
          status: 'new'
      }));
      setLeads(prev => [...prev, ...formattedLeads]);
      showToast(`${formattedLeads.length} leads imported and assigned to ${assignedToName}!`, 'success');
  };

  const generateMapUri = async (address: string) => {
    if (!ai) {
      const msg = "Gemini API key not configured. Please add your key in App.tsx.";
      setMapError(msg);
      showToast(msg, "error");
      return;
    }
    if (!MAPS_API_KEY || MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        const msg = "Google Maps API key not configured. Please add your key in App.tsx.";
        setMapError(msg);
        showToast(msg, "error");
        return;
    }

    setMapLoading(true);
    setMapError(null);
    setMapUri(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the precise location and place ID for this address: ${address}`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let placeId = null;

      if (chunks && chunks.length > 0) {
        for (const chunk of chunks) {
          if (chunk.maps && chunk.maps.uri) {
            try {
              const url = new URL(chunk.maps.uri);
              const id = url.searchParams.get('query_place_id');
              if (id) {
                placeId = id;
                break;
              }
            } catch (e) {
              console.error("Could not parse URI from grounding chunk:", chunk.maps.uri);
            }
          }
        }
      }

      if (placeId) {
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=place_id:${placeId}&maptype=satellite`;
        setMapUri(embedUrl);
      } else {
        // Fallback: if no place_id, use the address directly. Less accurate but better than nothing.
        console.warn("Could not find place_id from grounding, falling back to address query.");
        const encodedAddress = encodeURIComponent(address);
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodedAddress}&maptype=satellite`;
        setMapUri(embedUrl);
      }

    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || "Failed to generate map. The Gemini API call failed.";
      setMapError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setMapLoading(false);
    }
  };

  const handleAiInsightClick = async (lead: Lead) => {
    if (!ai) {
      showToast("Gemini API key not configured. Please add your key to enable AI features.", "error");
      return;
    }
    setSelectedLeadForAction(lead);
    setAiModalOpen(true);
    setIsAiLoading(true);
    setAiError(null);
    setAiInsight('');

    const prompt = `You are a sales assistant for a roofing company. Your goal is to help a salesperson schedule an appointment with a real estate agent for a property they have listed. Analyze the following lead data and generate a short, actionable script or a set of key talking points.

The talking points should:
1.  Be concise and professional.
2.  Help the salesperson quickly establish value for the real estate agent.
3.  Leverage specific data points like the 'roofFlag', 'lastSoldDate', 'permits', and 'homeValue' to create a compelling reason for a roof inspection.
4.  Focus on how a roof check can help the agent sell the property faster or for a better price.
5.  Be formatted in simple markdown (e.g., using bullet points or bold text).

Lead Data: ${JSON.stringify(lead, null, 2)}`;

    try {
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro', // Using Pro for a more nuanced and strategic response
        contents: prompt,
      });

      for await (const chunk of response) {
        setAiInsight(prev => prev + chunk.text);
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || "Failed to generate AI insights.";
      setAiError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateTemplate = async (prompt: string): Promise<string> => {
    if (!ai) {
      showToast("Gemini API key not configured. Cannot generate template.", "error");
      return "";
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || "Failed to generate template from AI.";
      showToast(errorMsg, "error");
      return "";
    }
  };


  const handleMapViewClick = (lead: Lead) => {
    setSelectedLeadForMap(lead);
    setMapModalOpen(true);
    const fullAddress = `${lead.address}, ${lead.city}, ${lead.zipCode}`;
    generateMapUri(fullAddress);
  };

  const handleSaveUser = (user: Omit<User, 'id' | 'avatar'>, id?: number) => {
    setTeam(prevTeam => {
      const newTeam = { ...prevTeam };
      
      // Remove from old team if editing and role changed
      if (id) {
          (['sales', 'dealers', 'admin'] as TeamType[]).forEach(teamKey => {
              newTeam[teamKey] = newTeam[teamKey].filter(m => m.id !== id);
          });
      }

      const avatar = `${user.firstName[0]}${user.lastName[0]}`;
      const newUser: TeamMember = { ...user, id: id || Date.now(), avatar, stats: { leads: 0, contacted: 0, converted: 0 } };

      if(userToEdit) { // If editing, copy old stats
         const oldUser = [...prevTeam.sales, ...prevTeam.dealers, ...prevTeam.admin].find(u => u.id === id);
         if(oldUser) newUser.stats = oldUser.stats;
      }
      
      newTeam[user.role] = [...newTeam[user.role], newUser].sort((a,b) => a.firstName.localeCompare(b.firstName));
      return newTeam;
    });
    showToast(`User ${id ? 'updated' : 'added'} successfully!`, 'success');
  };
  
  const handleEditUser = (user: TeamMember) => {
    setUserToEdit(user);
    setUserModalOpen(true);
  }

  const handleDeleteUser = (userId: number, teamType: TeamType) => {
    setTeam(prev => ({
        ...prev,
        [teamType]: prev[teamType].filter(u => u.id !== userId),
    }));
    showToast('User deleted successfully.', 'success');
  };

  const handleSaveSchedule = (event: Omit<CommunicationEvent, 'id'>) => {
      const newEvent = { ...event, id: Date.now() };
      setCommunications(prev => [...prev, newEvent]);
      showToast(`Event scheduled for ${event.date}`, 'success');
  };
  
  const handleLeadAction = (lead: Lead) => {
      setSelectedLeadForAction(lead);
      setLeadActionModalOpen(true);
  };
  
  const handleTransferClick = (lead: Lead) => {
      setSelectedLeadForAction(lead);
      setTransferModalOpen(true);
  };
  
  const handleSaveTransfer = (leadId: number, dealerName: string, date: string, time: string) => {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: dealerName, status: 'appointment' } : l));
      
      const newAppointment: CommunicationEvent = {
        id: Date.now(),
        leadId,
        type: 'appointment',
        date,
        time,
        notes: `Appointment scheduled with ${dealerName}.`
      };
      setCommunications(prev => [...prev, newAppointment]);

      showToast('Appointment scheduled and lead transferred!', 'success');
  }

    const handleCallDispositionSave = (data: CallSaveData) => {
        const { leadId, disposition, notes, transferDetails, jobRevenue } = data;
        if (!currentUser) return;

        const author = `${currentUser.firstName} ${currentUser.lastName}`;
        const newNote = {
            date: new Date().toISOString().split('T')[0],
            text: `Outcome: ${disposition}. Notes: ${notes || 'N/A'}`,
            author,
        };

        // --- Dealer Workflow ---
        if (currentUser.role === 'dealers') {
            if (disposition === 'closed') {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'closed job', jobRevenue: jobRevenue || l.jobRevenue, communication: { ...l.communication, notes: [...l.communication.notes, newNote] } } : l));
                showToast('Job successfully closed!', 'success');
            } else if (disposition === 'lost') {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'lost job', communication: { ...l.communication, notes: [...l.communication.notes, newNote] } } : l));
                showToast('Job marked as lost.', 'info');
            }
            return;
        }

        // --- Salesperson Workflow ---
        setLeads(prevLeads => prevLeads.map(l => {
            if (l.id === leadId) {
                let updatedLead = { ...l };
                
                updatedLead.communication = { ...l.communication, notes: [...l.communication.notes, newNote] };
                updatedLead.assignedTo = author;
                
                if (disposition === 'transfer' && transferDetails) {
                    const dealer = team.dealers.find(d => d.id.toString() === transferDetails.dealerId);
                    if (dealer) {
                        updatedLead.assignedTo = `${dealer.firstName} ${dealer.lastName}`;
                        updatedLead.status = 'appointment';

                        const newAppointment: CommunicationEvent = {
                            id: Date.now(),
                            leadId,
                            type: 'appointment',
                            date: transferDetails.date,
                            time: transferDetails.time,
                            notes: `Appointment scheduled by ${author} with ${updatedLead.assignedTo}.`
                        };
                        setCommunications(prev => [...prev, newAppointment]);
                        
                        showToast('Appointment scheduled and lead transferred!', 'success');
                    }
                }
                return updatedLead;
            }
            return l;
        }));
        
        if (disposition !== 'transfer') {
            showToast(`Call for lead #${leadId} logged and assigned to you.`, 'success');
        }
    };
  
  const handleSaveClosedJob = (leadId: number, revenue: number, photos: string[]) => {
      setLeads(prev => prev.map(l => {
          if (l.id === leadId) {
              return {
                  ...l,
                  status: 'closed job',
                  jobRevenue: revenue,
                  jobPhotos: [...(l.jobPhotos || []), ...photos],
              };
          }
          return l;
      }));
      showToast('Job successfully closed and details saved!', 'success');
  };
  
  const handleMarkAsLost = (leadId: number) => {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'lost job' } : l));
      showToast('Job marked as lost.', 'info');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={USERS} />;
  }
  
  const allTeamMembers = [...team.sales, ...team.dealers, ...team.admin];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage leads={leads} team={allTeamMembers} currentUser={currentUser} />;
      case 'leads': return <LeadsPage 
            leads={leads} 
            currentUser={currentUser} 
            onImportClick={() => setImportModalOpen(true)} 
            onMapViewClick={handleMapViewClick} 
            onActionClick={handleLeadAction} 
            onCallClick={(lead) => { setSelectedLeadForAction(lead); setCallDispositionModalOpen(true); }}
            onCloseJobClick={(lead) => { setSelectedLeadForAction(lead); setJobDetailsModalOpen(true); }}
            onMarkAsLostClick={(lead) => handleMarkAsLost(lead.id)}
            onViewJobClick={(lead) => { setSelectedLeadForAction(lead); setJobDetailsModalOpen(true); }}
            onAiInsightClick={handleAiInsightClick}
        />;
      case 'analytics': return <AnalyticsPage leads={leads} team={team} />;
      case 'calendar': return <CalendarPage communications={communications} leads={leads} onScheduleClick={() => setScheduleModalOpen(true)} currentUser={currentUser} />;
      case 'team': return <TeamPage team={team} onAddUserClick={() => { setUserToEdit(null); setUserModalOpen(true); }} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser}/>;
      case 'settings': return <SettingsPage isCalendarSynced={isCalendarSynced} onCalendarSyncToggle={setIsCalendarSynced} showToast={showToast} onGenerateTemplate={handleGenerateTemplate} />;
      default: return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex bg-light min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <Header currentUser={currentUser} onSearch={() => {}} />
        {renderPage()}
      </main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ExcelImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setImportModalOpen(false)} 
        onImport={handleImportLeads}
        salesTeam={team.sales}
      />
      <MapModal 
        isOpen={isMapModalOpen} 
        onClose={() => setMapModalOpen(false)} 
        lead={selectedLeadForMap}
        mapUri={mapUri}
        isLoading={isMapLoading}
        error={mapError}
      />
      <UserModal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)} onSave={handleSaveUser} userToEdit={userToEdit} />
      <ScheduleModal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} onSave={handleSaveSchedule} leads={leads} />
      <LeadActionModal 
        isOpen={isLeadActionModalOpen}
        onClose={() => setLeadActionModalOpen(false)}
        lead={selectedLeadForAction}
        currentUser={currentUser}
        onCallClick={(lead) => setCallDispositionModalOpen(true)}
        onSmsClick={(lead) => showToast(`SMS action for ${lead.agentName}`, 'info')}
        onVoicemailClick={(lead) => showToast(`Voicemail action for ${lead.agentName}`, 'info')}
        onMapViewClick={handleMapViewClick}
        onTransferClick={handleTransferClick}
      />
      <CallDispositionModal 
        isOpen={isCallDispositionModalOpen}
        onClose={() => setCallDispositionModalOpen(false)}
        lead={selectedLeadForAction}
        currentUser={currentUser}
        onSave={handleCallDispositionSave}
        dealers={team.dealers}
      />
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        lead={selectedLeadForAction}
        dealers={team.dealers}
        onSave={handleSaveTransfer}
       />
       <JobDetailsModal
        isOpen={isJobDetailsModalOpen}
        onClose={() => setJobDetailsModalOpen(false)}
        lead={selectedLeadForAction}
        onSave={handleSaveClosedJob}
        currentUser={currentUser}
       />
       <AiInsightsModal
        isOpen={isAiModalOpen}
        onClose={() => setAiModalOpen(false)}
        lead={selectedLeadForAction}
        insightText={aiInsight}
        isLoading={isAiLoading}
        error={aiError}
       />
    </div>
  );
};

export default App;
