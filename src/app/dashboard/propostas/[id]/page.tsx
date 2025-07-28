'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Proposal, ProposalDescription } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Edit, MessageCircle, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PropostaDetalhePage() {
  const { user } = useAuth();
  const params = useParams();
  const proposalId = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (user && proposalId) {
      loadProposal();
    }
  }, [user, proposalId]);

  const loadProposal = async () => {
    try {
      const proposalDoc = await getDoc(doc(db, 'proposals', proposalId));
      if (proposalDoc.exists()) {
        const data = proposalDoc.data();
        setProposal({
          id: proposalDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Proposal);
      } else {
        toast.error('Proposta não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar proposta:', error);
      toast.error('Erro ao carregar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !proposal) return;

    try {
      const newDesc: ProposalDescription = {
        id: Date.now().toString(),
        text: newDescription,
        createdAt: new Date(),
      };

      await updateDoc(doc(db, 'proposals', proposal.id), {
        descriptions: arrayUnion(newDesc),
        updatedAt: serverTimestamp(),
      });

      setProposal(prev => prev ? {
        ...prev,
        descriptions: [...prev.descriptions, newDesc],
        updatedAt: new Date(),
      } : null);

      setNewDescription('');
      setShowDescriptionModal(false);
      toast.success('Descrição adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar descrição:', error);
      toast.error('Erro ao adicionar descrição');
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

  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Proposta não encontrada</p>
          <Link href="/dashboard/propostas" className="btn-primary">
            Voltar para Propostas
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const canEdit = user?.role === 'seller' && proposal.sellerId === user.id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/propostas"
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{proposal.provider}</h1>
              <p className="text-gray-600">Detalhes da proposta</p>
            </div>
          </div>
          {canEdit && (
            <Link
              href={`/dashboard/propostas/${proposal.id}/editar`}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Provedor</label>
                <p className="text-gray-900 font-medium">{proposal.provider}</p>
              </div>

              {proposal.responsibleName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Responsável</label>
                  <p className="text-gray-900">{proposal.responsibleName}</p>
                </div>
              )}

              {proposal.whatsapp && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">WhatsApp</label>
                  <p className="text-gray-900">{proposal.whatsapp}</p>
                </div>
              )}

              {proposal.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">E-mail</label>
                  <p className="text-gray-900">{proposal.email}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className={getStatusColor(proposal.status)}>
                  {proposal.status}
                </span>
              </div>

              {proposal.status === 'Concluído com sucesso' && (
                <>
                  {proposal.plan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Plano Fechado</label>
                      <p className="text-gray-900">{proposal.plan}</p>
                    </div>
                  )}
                  {proposal.value && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Valor</label>
                      <p className="text-gray-900 font-semibold text-green-600">
                        R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Data de Criação</label>
                <p className="text-gray-900">{format(proposal.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Última Atualização</label>
                <p className="text-gray-900">{format(proposal.updatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
            </div>
          </div>

          {/* Histórico de Descrições */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Descrições</h2>
              {canEdit && (
                <button
                  onClick={() => setShowDescriptionModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Adicionar
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {proposal.descriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma descrição adicionada</p>
              ) : (
                proposal.descriptions
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((desc) => (
                    <div key={desc.id} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 mb-2">{desc.text}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(desc.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Modal para adicionar descrição */}
        {showDescriptionModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDescriptionModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleAddDescription}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Adicionar Descrição
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="input"
                        rows={4}
                        placeholder="Descreva as atualizações, negociações ou observações..."
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto sm:ml-3"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDescriptionModal(false)}
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
      </div>
    </DashboardLayout>
  );
}
