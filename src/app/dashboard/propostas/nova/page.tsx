'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NovaPropostaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    whatsapp: '',
    email: '',
    responsibleName: '',
    status: 'Inicio' as const,
    description: '',
  });

  useEffect(() => {
    // Preencher formulário com dados dos parâmetros da URL (vindos do lead)
    const provider = searchParams.get('provider');
    const contact = searchParams.get('contact');
    const email = searchParams.get('email');
    const fromLead = searchParams.get('fromLead');

    if (fromLead && provider) {
      setFormData(prev => ({
        ...prev,
        provider,
        whatsapp: contact && !contact.includes('@') ? contact : '',
        email: email || (contact && contact.includes('@') ? contact : ''),
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const proposalData = {
        sellerId: user.id,
        provider: formData.provider,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        responsibleName: formData.responsibleName || null,
        status: formData.status,
        descriptions: formData.description ? [{
          id: Date.now().toString(),
          text: formData.description,
          createdAt: new Date(),
        }] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'proposals'), proposalData);
      toast.success('Proposta criada com sucesso!');
      router.push('/dashboard/propostas');
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      toast.error('Erro ao criar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Proposta</h1>
            <p className="text-gray-600">Crie uma nova proposta comercial</p>
          </div>
          <Link
            href="/dashboard/propostas"
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
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

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Descreva os detalhes da proposta..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/dashboard/propostas"
                className="btn-secondary"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Proposta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
