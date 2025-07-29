'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Meeting, Proposal } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../calendar.css';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Clock, MapPin, Phone, Mail, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AgendaPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    proposalId: '',
    provider: '',
    type: 'E-mail' as const,
    contact: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Carregar reuniões
      let meetingsQuery;
      if (user.role === 'admin') {
        meetingsQuery = query(collection(db, 'meetings'), orderBy('date', 'asc'));
      } else {
        // Removendo orderBy para evitar necessidade de índice composto
        meetingsQuery = query(
          collection(db, 'meetings'),
          where('sellerId', '==', user.id)
        );
      }

      const meetingsSnapshot = await getDocs(meetingsQuery);
      let meetingsData = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Meeting[];

      // Ordenar no cliente se for vendedor
      if (user.role !== 'admin') {
        meetingsData = meetingsData.sort((a, b) => a.date.getTime() - b.date.getTime());
      }

      setMeetings(meetingsData);

      // Carregar propostas
      let proposalsQuery;
      if (user.role === 'admin') {
        proposalsQuery = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
      } else {
        // Removendo orderBy para evitar necessidade de índice composto
        proposalsQuery = query(
          collection(db, 'proposals'),
          where('sellerId', '==', user.id)
        );
      }

      const proposalsSnapshot = await getDocs(proposalsQuery);
      let proposalsData = proposalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Proposal[];

      // Ordenar no cliente se for vendedor
      if (user.role !== 'admin') {
        proposalsData = proposalsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      setProposals(proposalsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleScheduleMeeting = () => {
    setShowModal(true);
    setFormData({
      proposalId: '',
      provider: '',
      type: 'E-mail',
      contact: '',
      time: '',
      notes: '',
    });
  };

  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const selectedProposal = proposals.find(p => p.id === formData.proposalId);
      
      const meetingData = {
        sellerId: user.id,
        proposalId: formData.proposalId,
        provider: selectedProposal?.provider || formData.provider,
        date: selectedDate,
        time: formData.time,
        type: formData.type,
        contact: formData.contact,
        notes: formData.notes || null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'meetings'), meetingData);
      toast.success('Reunião agendada com sucesso!');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao agendar reunião:', error);
      toast.error('Erro ao agendar reunião');
    }
  };

  const handleProposalSelect = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    setFormData(prev => ({
      ...prev,
      proposalId,
      provider: proposal?.provider || '',
    }));
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => isSameDay(meeting.date, date));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'E-mail':
        return <Mail className="h-4 w-4" />;
      case 'Ligação':
        return <Phone className="h-4 w-4" />;
      case 'WhatsApp':
        return <Phone className="h-4 w-4" />;
      case 'Vídeo Chamada':
        return <Video className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dayMeetings = getMeetingsForDate(date);
    if (dayMeetings.length > 0) {
      return (
        <div className="flex justify-center">
          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600">Gerencie suas reuniões e compromissos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendário */}
          <div className="card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Calendário</h2>
            </div>
            <div className="calendar-container">
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                locale="pt-BR"
                tileContent={tileContent}
                className="react-calendar"
              />
            </div>
          </div>

          {/* Reuniões do dia selecionado */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
              </h2>
              <button
                onClick={handleScheduleMeeting}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agendar Reunião
              </button>
            </div>

            <div className="space-y-3">
              {getMeetingsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma reunião agendada para este dia
                </p>
              ) : (
                getMeetingsForDate(selectedDate).map((meeting) => (
                  <div key={meeting.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{meeting.provider}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          {getTypeIcon(meeting.type)}
                          <span>{meeting.type}</span>
                          <span>•</span>
                          <span>{meeting.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{meeting.contact}</p>
                        {meeting.notes && (
                          <p className="text-sm text-gray-500 mt-2">{meeting.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal para agendar reunião */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmitMeeting}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Agendar Reunião - {format(selectedDate, 'dd/MM/yyyy')}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proposta Existente (opcional)
                        </label>
                        <select
                          value={formData.proposalId}
                          onChange={(e) => handleProposalSelect(e.target.value)}
                          className="input"
                        >
                          <option value="">Selecione uma proposta ou digite manualmente</option>
                          {proposals.map((proposal) => (
                            <option key={proposal.id} value={proposal.id}>
                              {proposal.provider}
                            </option>
                          ))}
                        </select>
                      </div>

                      {!formData.proposalId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provedor *
                          </label>
                          <input
                            type="text"
                            value={formData.provider}
                            onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                            className="input"
                            placeholder="Nome do provedor"
                            required={!formData.proposalId}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Reunião *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                          className="input"
                          required
                        >
                          <option value="E-mail">E-mail</option>
                          <option value="Ligação">Ligação</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Vídeo Chamada">Vídeo Chamada</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horário *
                          </label>
                          <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                            className="input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contato *
                          </label>
                          <input
                            type="text"
                            value={formData.contact}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                            className="input"
                            placeholder="Contato para reunião"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Anotações
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="input"
                          rows={3}
                          placeholder="Anotações sobre a reunião..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto sm:ml-3"
                    >
                      Agendar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          .react-calendar {
            width: 100%;
            background: white;
            border: 1px solid #e5e7eb;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.125em;
            border-radius: 0.5rem;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
