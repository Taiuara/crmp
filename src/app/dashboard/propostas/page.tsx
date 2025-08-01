'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Proposal } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PropostasPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProposals();
    }
  }, [user]);

  const loadProposals = async () => {
    if (!user) return;

    try {
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

      const snapshot = await getDocs(proposalsQuery);
      let proposalsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate() 
            : new Date(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate() 
            : new Date(),
        };
      }) as Proposal[];

      // Ordenar no cliente se for vendedor
      if (user.role !== 'admin') {
        proposalsData = proposalsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      setProposals(proposalsData);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      toast.error('Erro ao carregar propostas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'proposals', proposalId));
      setProposals(proposals.filter(p => p.id !== proposalId));
      toast.success('Proposta excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      toast.error('Erro ao excluir proposta');
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
            <p className="text-gray-600">Gerencie suas propostas comerciais</p>
          </div>
          <Link
            href="/dashboard/propostas/nova"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Link>
        </div>

        <div className="card">
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhuma proposta encontrada</p>
              <Link href="/dashboard/propostas/nova" className="btn-primary">
                Criar primeira proposta
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposals.map((proposal) => (
                    <tr key={proposal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{proposal.provider}</p>
                          {proposal.whatsapp && (
                            <p className="text-sm text-gray-500">{proposal.whatsapp}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {proposal.responsibleName || '-'}
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
                        {proposal.createdAt instanceof Date && !isNaN(proposal.createdAt.getTime()) 
                          ? format(proposal.createdAt, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Data inválida'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/propostas/${proposal.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {(user?.role === 'seller' || user?.role === 'admin') && (
                            <>
                              <Link
                                href={`/dashboard/propostas/${proposal.id}/editar`}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              {user?.role !== 'admin' && (
                                <button
                                  onClick={() => handleDelete(proposal.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
