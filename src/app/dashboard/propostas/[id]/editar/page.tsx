'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Proposal, ProposalDescription } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function EditarPropostaPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    whatsapp: '',
    email: '',
    responsibleName: '',
    status: 'Inicio' as 'Inicio' | 'Negociando' | 'Quase fechando' | 'Concluído com sucesso' | 'Encerrado por falta de interesse',
    plan: '',
    value: '',
    newDescription: '',
  });

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
        const proposalData = {
          id: proposalDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Proposal;

        setProposal(proposalData);
        setFormData({
          provider: proposalData.provider,
          whatsapp: proposalData.whatsapp || '',
          email: proposalData.email || '',
          responsibleName: proposalData.responsibleName || '',
          status: proposalData.status,
          plan: proposalData.plan || '',
          value: proposalData.value?.toString() || '',
          newDescription: '',
        });
      } else {
        toast.error('Proposta não encontrada');
        router.push('/dashboard/propostas');
      }
    } catch (error) {
      console.error('Erro ao carregar proposta:', error);
      toast.error('Erro ao carregar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal || !user) return;

    // Verificar se o usuário pode editar esta proposta
    if (user.role === 'seller' && proposal.sellerId !== user.id) {
      toast.error('Você não tem permissão para editar esta proposta');
      return;
    }

    // Validar campos obrigatórios para status "Concluído com sucesso"
    if (formData.status === 'Concluído com sucesso') {
      if (!formData.plan || !formData.value) {
        toast.error('Para propostas concluídas, é obrigatório preencher o plano e o valor');
        return;
      }
    }

    setSaving(true);

    try {
      const updateData: any = {
        provider: formData.provider,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        responsibleName: formData.responsibleName || null,
        status: formData.status,
        updatedAt: serverTimestamp(),
      };

      // Adicionar plano e valor apenas se status for "Concluído com sucesso"
      if (formData.status === 'Concluído com sucesso') {
        updateData.plan = formData.plan;
        updateData.value = parseFloat(formData.value);
      } else {
        // Remover plano e valor se status não for concluído
        updateData.plan = null;
        updateData.value = null;
      }

      // Adicionar nova descrição se foi preenchida
      if (formData.newDescription.trim()) {
        const newDesc: ProposalDescription = {
          id: Date.now().toString(),
          text: formData.newDescription,
          createdAt: new Date(),
        };
        updateData.descriptions = arrayUnion(newDesc);
      }

      await updateDoc(doc(db, 'proposals', proposal.id), updateData);
      toast.success('Proposta atualizada com sucesso!');
      router.push(`/dashboard/propostas/${proposal.id}`);
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      toast.error('Erro ao atualizar proposta');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

  // Verificar permissões
  if (user?.role === 'seller' && proposal.sellerId !== user.id) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Você não tem permissão para editar esta proposta</p>
          <Link href="/dashboard/propostas" className="btn-primary">
            Voltar para Propostas
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (user?.role === 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Administradores podem apenas visualizar propostas</p>
          <Link href={`/dashboard/propostas/${proposal.id}`} className="btn-primary">
            Visualizar Proposta
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/propostas/${proposal.id}`}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Proposta</h1>
              <p className="text-gray-600">{proposal.provider}</p>
            </div>
          </div>
        </div>

        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                Provedor *
              </label>
              <input
                type="text"
                id="provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                className="input"
                placeholder="Nome do provedor"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="input"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="contato@provedor.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="responsibleName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Responsável
              </label>
              <input
                type="text"
                id="responsibleName"
                name="responsibleName"
                value={formData.responsibleName}
                onChange={handleChange}
                className="input"
                placeholder="Nome da pessoa responsável"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="Inicio">Início</option>
                <option value="Negociando">Negociando</option>
                <option value="Quase fechando">Quase fechando</option>
                <option value="Concluído com sucesso">Concluído com sucesso</option>
                <option value="Encerrado por falta de interesse">Encerrado por falta de interesse</option>
              </select>
            </div>

            {/* Campos obrigatórios para status "Concluído com sucesso" */}
            {formData.status === 'Concluído com sucesso' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-medium text-green-800">Dados da Venda</h3>
                
                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                    Plano Fechado *
                  </label>
                  <input
                    type="text"
                    id="plan"
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="input"
                    placeholder="Nome do plano vendido"
                    required={formData.status === 'Concluído com sucesso'}
                  />
                </div>

                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Plano (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    className="input"
                    placeholder="0.00"
                    required={formData.status === 'Concluído com sucesso'}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="newDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Descrição
              </label>
              <textarea
                id="newDescription"
                name="newDescription"
                value={formData.newDescription}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Adicione uma nova descrição sobre a proposta..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Se preenchida, será adicionada ao histórico de descrições
              </p>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Link
                href={`/dashboard/propostas/${proposal.id}`}
                className="btn-secondary"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
