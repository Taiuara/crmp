'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, FileText, Calculator, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  features: string[];
  basePrice: number;
  category: 'internet' | 'telefonia' | 'tv' | 'pacote';
}

const templates: ProposalTemplate[] = [
  {
    id: 'internet-basico',
    name: 'Internet Banda Larga - Básico',
    description: 'Plano de internet ideal para uso residencial básico',
    features: [
      'Velocidade de 100 Mbps',
      'Wi-Fi grátis',
      'Instalação gratuita',
      'Suporte técnico 24h',
      'Sem fidelidade'
    ],
    basePrice: 79.90,
    category: 'internet'
  },
  {
    id: 'internet-premium',
    name: 'Internet Banda Larga - Premium',
    description: 'Plano de internet para uso intensivo e profissional',
    features: [
      'Velocidade de 500 Mbps',
      'Wi-Fi 6 grátis',
      'Instalação gratuita',
      'Suporte técnico 24h',
      'IP fixo incluso',
      'Roteador Premium',
      'Antivírus grátis'
    ],
    basePrice: 149.90,
    category: 'internet'
  },
  {
    id: 'telefonia-empresarial',
    name: 'Telefonia Empresarial',
    description: 'Solução completa de telefonia para empresas',
    features: [
      'Linhas ilimitadas',
      'DDD nacional grátis',
      'Central telefônica virtual',
      'Gravação de chamadas',
      'Relatórios detalhados',
      'Suporte técnico especializado'
    ],
    basePrice: 199.90,
    category: 'telefonia'
  },
  {
    id: 'pacote-completo',
    name: 'Pacote Completo - Triplo Play',
    description: 'Internet + TV + Telefone com desconto especial',
    features: [
      'Internet 300 Mbps',
      'TV com 150+ canais',
      'Telefone fixo ilimitado',
      'Netflix incluso',
      'Paramount+ incluso',
      'Wi-Fi 6 grátis',
      'Instalação gratuita'
    ],
    basePrice: 199.90,
    category: 'pacote'
  }
];

export default function MontarPropostaPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [clientData, setClientData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [customizations, setCustomizations] = useState({
    discount: 0,
    additionalFeatures: '',
    observations: '',
    validUntil: '',
  });

  const handleGenerateProposal = () => {
    if (!selectedTemplate) {
      toast.error('Selecione um template de proposta');
      return;
    }

    if (!clientData.companyName || !clientData.contactName) {
      toast.error('Preencha pelo menos o nome da empresa e contato');
      return;
    }

    // Simular geração de PDF
    const finalPrice = selectedTemplate.basePrice * (1 - customizations.discount / 100);
    
    const proposalContent = `
PROPOSTA COMERCIAL - ${selectedTemplate.name}

DADOS DO CLIENTE:
Empresa: ${clientData.companyName}
Contato: ${clientData.contactName}
E-mail: ${clientData.email}
Telefone: ${clientData.phone}
Endereço: ${clientData.address}

DESCRIÇÃO DO SERVIÇO:
${selectedTemplate.description}

RECURSOS INCLUSOS:
${selectedTemplate.features.map(feature => `• ${feature}`).join('\n')}

${customizations.additionalFeatures ? `RECURSOS ADICIONAIS:\n${customizations.additionalFeatures}` : ''}

INVESTIMENTO:
Valor base: R$ ${selectedTemplate.basePrice.toFixed(2)}
${customizations.discount > 0 ? `Desconto: ${customizations.discount}%` : ''}
Valor final: R$ ${finalPrice.toFixed(2)}

${customizations.observations ? `OBSERVAÇÕES:\n${customizations.observations}` : ''}

${customizations.validUntil ? `Proposta válida até: ${customizations.validUntil}` : ''}

---
Proposta gerada pelo CRM PingDesk
Data: ${new Date().toLocaleDateString('pt-BR')}
    `;

    // Criar e baixar arquivo
    const blob = new Blob([proposalContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Proposta_${clientData.companyName}_${selectedTemplate.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Proposta gerada e baixada com sucesso!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'internet':
        return 'bg-blue-100 text-blue-800';
      case 'telefonia':
        return 'bg-green-100 text-green-800';
      case 'tv':
        return 'bg-purple-100 text-purple-800';
      case 'pacote':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'internet':
        return 'Internet';
      case 'telefonia':
        return 'Telefonia';
      case 'tv':
        return 'TV';
      case 'pacote':
        return 'Pacote';
      default:
        return 'Outros';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Montar Proposta</h1>
          <p className="text-gray-600">Crie propostas comerciais personalizadas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates de Proposta */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Templates de Proposta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(template.category)}`}>
                          {getCategoryName(template.category)}
                        </span>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="space-y-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <p key={index} className="text-xs text-gray-500">• {feature}</p>
                      ))}
                      {template.features.length > 3 && (
                        <p className="text-xs text-gray-400">+ {template.features.length - 3} recursos</p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-lg font-bold text-gray-900">
                        R$ {template.basePrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulário de Customização */}
          <div className="space-y-6">
            {/* Dados do Cliente */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={clientData.companyName}
                    onChange={(e) => setClientData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="input"
                    placeholder="Razão social ou nome fantasia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    value={clientData.contactName}
                    onChange={(e) => setClientData(prev => ({ ...prev, contactName: e.target.value }))}
                    className="input"
                    placeholder="Nome do responsável"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={clientData.phone}
                    onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <textarea
                    value={clientData.address}
                    onChange={(e) => setClientData(prev => ({ ...prev, address: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
            </div>

            {/* Customizações */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customizações</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customizations.discount}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, discount: Number(e.target.value) }))}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recursos Adicionais
                  </label>
                  <textarea
                    value={customizations.additionalFeatures}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, additionalFeatures: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="Recursos extras não inclusos no template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={customizations.observations}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, observations: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válida até
                  </label>
                  <input
                    type="date"
                    value={customizations.validUntil}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Preview do Valor */}
            {selectedTemplate && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor base:</span>
                    <span className="font-medium">R$ {selectedTemplate.basePrice.toFixed(2)}</span>
                  </div>
                  {customizations.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Desconto ({customizations.discount}%):</span>
                      <span>- R$ {(selectedTemplate.basePrice * customizations.discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Valor final:</span>
                      <span>R$ {(selectedTemplate.basePrice * (1 - customizations.discount / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botão Gerar */}
            <button
              onClick={handleGenerateProposal}
              disabled={!selectedTemplate}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Gerar Proposta
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
