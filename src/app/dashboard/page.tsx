'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Proposal, Meeting } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, DollarSign, FileText, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { format, isToday, isBefore, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
      checkUpcomingMeetings();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      let proposalsQuery;
      if (user.role === 'admin') {
        proposalsQuery = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
      } else {
        proposalsQuery = query(
          collection(db, 'proposals'),
          where('sellerId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
      }

      const proposalsSnapshot = await getDocs(proposalsQuery);
      const proposalsData = proposalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Proposal[];

      setProposals(proposalsData);

      // Carregar reuniões
      let meetingsQuery;
      if (user.role === 'admin') {
        meetingsQuery = query(collection(db, 'meetings'), orderBy('date', 'asc'));
      } else {
        meetingsQuery = query(
          collection(db, 'meetings'),
          where('sellerId', '==', user.id),
          orderBy('date', 'asc')
        );
      }

      const meetingsSnapshot = await getDocs(meetingsQuery);
      const meetingsData = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Meeting[];

      setMeetings(meetingsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingMeetings = () => {
    const now = new Date();
    const upcomingMeetings = meetings.filter(meeting => {
      const meetingDateTime = new Date(meeting.date);
      const timeParts = meeting.time.split(':');
      meetingDateTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
      
      const hoursBefore = addHours(meetingDateTime, -1);
      return isToday(meetingDateTime) && isBefore(now, meetingDateTime) && isBefore(hoursBefore, now);
    });

    upcomingMeetings.forEach(meeting => {
      toast(`Reunião com ${meeting.provider} em 1 hora!`, {
        icon: '⏰',
        duration: 10000,
      });
    });
  };

  const getStats = () => {
    const totalProposals = proposals.length;
    const successfulProposals = proposals.filter(p => p.status === 'Concluído com sucesso');
    const totalValue = successfulProposals.reduce((sum, p) => sum + (p.value || 0), 0);
    
    // Para vendedores, mostrar 80% do valor
    const displayValue = user?.role === 'seller' ? totalValue * 0.8 : totalValue;
    
    const todayMeetings = meetings.filter(m => isToday(m.date));

    return {
      totalProposals,
      successfulProposals: successfulProposals.length,
      totalValue: displayValue,
      todayMeetings: todayMeetings.length,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Inicio':
        return 'status-inicio';
      case 'Negociando':
        return 'status-negociando';
      case 'Quase fechando':
        return 'status-quase-fechando';
      case 'Concluído com sucesso':
        return 'status-concluido';
      case 'Encerrado por falta de interesse':
        return 'status-encerrado';
      default:
        return 'status-inicio';
    }
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

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas atividades</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Propostas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProposals}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vendas Fechadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulProposals}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Faturamento {user?.role === 'seller' ? '(80%)' : ''}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reuniões Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayMeetings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Propostas Recentes</h2>
          </div>
          {proposals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma proposta encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposals.slice(0, 5).map((proposal) => (
                    <tr key={proposal.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {proposal.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {proposal.value ? 
                          `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(proposal.createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Today's Meetings */}
        {meetings.filter(m => isToday(m.date)).length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Reuniões de Hoje</h2>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {meetings.filter(m => isToday(m.date)).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{meeting.provider}</p>
                    <p className="text-sm text-gray-600">{meeting.type} - {meeting.contact}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{meeting.time}</p>
                    <p className="text-sm text-gray-600">Hoje</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
