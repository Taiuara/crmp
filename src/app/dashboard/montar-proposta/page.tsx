'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  features: string[];
  basePrice: number;
  priceLabel: string;
  category: 'atendimento';
  icon: string;
  franchise?: string;
  additionalValues?: {
    nivel1: number;
    nivel2: number;
    massivos: number;
    vendasReceptivas: string;
  };
  perCall?: {
    nivel1: number;
    nivel2: number;
    massivos: number;
    vendasReceptivas: string;
  };
}

const templates: ProposalTemplate[] = [
  {
    id: 'atendimento-24h',
    name: 'Atendimento 24h / 7 dias',
    description: 'Atendimento completo 24 horas por dia, 7 dias por semana',
    features: [
      'Atendimento 24h / 7 dias',
      'Franquia: 1000 chamados',
      'Nível 1: R$ 3,50',
      'Nível 2: R$ 4,50', 
      'Massivos: R$ 1,50',
      'Vendas Receptivas: 50% do plano instalado'
    ],
    basePrice: 5000,
    priceLabel: '/mês',
    category: 'atendimento',
    icon: '📞',
    franchise: '1000 chamados',
    additionalValues: {
      nivel1: 3.50,
      nivel2: 4.50,
      massivos: 1.50,
      vendasReceptivas: '50% do plano instalado'
    }
  },
  {
    id: 'fora-horario',
    name: 'Fora do Horário Comercial',
    description: 'Atendimento especializado fora do horário comercial',
    features: [
      'Atendimento fora do horário comercial',
      'Franquia: 500 chamados',
      'Nível 1: R$ 3,50',
      'Nível 2: R$ 4,50',
      'Massivos: R$ 1,50', 
      'Vendas Receptivas: 50% do plano instalado'
    ],
    basePrice: 2500,
    priceLabel: '/mês',
    category: 'atendimento',
    icon: '🌙',
    franchise: '500 chamados',
    additionalValues: {
      nivel1: 3.50,
      nivel2: 4.50,
      massivos: 1.50,
      vendasReceptivas: '50% do plano instalado'
    }
  },
  {
    id: 'finais-semana',
    name: 'Finais de Semana e Feriados',
    description: 'Atendimento especializado para finais de semana e feriados',
    features: [
      'Atendimento em finais de semana e feriados',
      'Franquia: 250 chamados',
      'Nível 1: R$ 3,50',
      'Nível 2: R$ 4,50',
      'Massivos: R$ 1,50',
      'Vendas Receptivas: 50% do plano instalado'
    ],
    basePrice: 1000,
    priceLabel: '/mês',
    category: 'atendimento',
    icon: '🎯',
    franchise: '250 chamados',
    additionalValues: {
      nivel1: 3.50,
      nivel2: 4.50,
      massivos: 1.50,
      vendasReceptivas: '50% do plano instalado'
    }
  },
  {
    id: 'por-chamado',
    name: 'Por Chamado',
    description: 'Pagamento apenas por chamados realizados, sem mensalidade fixa',
    features: [
      'Sem mensalidade fixa',
      'Nível 1: R$ 5,50',
      'Nível 2: R$ 6,50', 
      'Massivos: R$ 3,50',
      'Vendas Receptivas: 80% do plano instalado'
    ],
    basePrice: 0,
    priceLabel: 'Sem mensalidade fixa',
    category: 'atendimento',
    icon: '💡',
    perCall: {
      nivel1: 5.50,
      nivel2: 6.50,
      massivos: 3.50,
      vendasReceptivas: '80% do plano instalado'
    }
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
    additionalFeatures: '',
    discount: 0,
    observations: '',
    validUntil: '',
  });

  const generateProposal = () => {
    if (!selectedTemplate) {
      toast.error('Selecione um plano primeiro');
      return;
    }

    if (!clientData.companyName || !clientData.contactName) {
      toast.error('Preencha pelo menos o nome da empresa e contato');
      return;
    }

    const finalPrice = selectedTemplate.basePrice * (1 - customizations.discount / 100);
    
    const proposalContent = `PROPOSTA COMERCIAL - ${selectedTemplate.name}

DADOS DO CLIENTE:
Empresa: ${clientData.companyName}
Contato: ${clientData.contactName}
E-mail: ${clientData.email}
Telefone: ${clientData.phone}
Endereço: ${clientData.address}

PLANO SELECIONADO:
${selectedTemplate.icon} ${selectedTemplate.name}
${selectedTemplate.description}

CARACTERÍSTICAS DO PLANO:
${selectedTemplate.features.map(feature => `• ${feature}`).join('\n')}

${selectedTemplate.franchise ? `FRANQUIA INCLUÍDA: ${selectedTemplate.franchise}` : ''}

${selectedTemplate.additionalValues ? `
VALORES ADICIONAIS:
• Nível 1: R$ ${selectedTemplate.additionalValues.nivel1.toFixed(2)}
• Nível 2: R$ ${selectedTemplate.additionalValues.nivel2.toFixed(2)}
• Massivos: R$ ${selectedTemplate.additionalValues.massivos.toFixed(2)}
• Vendas Receptivas: ${selectedTemplate.additionalValues.vendasReceptivas}
` : ''}

${selectedTemplate.perCall ? `
VALORES POR CHAMADO:
• Nível 1: R$ ${selectedTemplate.perCall.nivel1.toFixed(2)}
• Nível 2: R$ ${selectedTemplate.perCall.nivel2.toFixed(2)}
• Massivos: R$ ${selectedTemplate.perCall.massivos.toFixed(2)}
• Vendas Receptivas: ${selectedTemplate.perCall.vendasReceptivas}
` : ''}

${customizations.additionalFeatures ? `RECURSOS ADICIONAIS:\n${customizations.additionalFeatures}` : ''}

INVESTIMENTO:
${selectedTemplate.basePrice > 0 ? `Valor mensal: R$ ${selectedTemplate.basePrice.toLocaleString('pt-BR')}` : 'Sem mensalidade fixa'}
${customizations.discount > 0 ? `Desconto: ${customizations.discount}%` : ''}
${selectedTemplate.basePrice > 0 ? `Valor final: R$ ${finalPrice.toLocaleString('pt-BR')}/mês` : ''}

${customizations.observations ? `OBSERVAÇÕES:\n${customizations.observations}` : ''}

${customizations.validUntil ? `Proposta válida até: ${customizations.validUntil}` : ''}

---
Proposta gerada pelo CRM PingDesk
Data: ${new Date().toLocaleDateString('pt-BR')}`;

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Montar Proposta</h1>
          <p className="text-gray-600">Crie propostas comerciais personalizadas com nossos planos de atendimento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                📞 Planos de Atendimento PingDesk
              </h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-6 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary-500 bg-primary-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 bg-blue-100 text-blue-800">
                            Atendimento
                          </span>
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Check className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-gray-900">
                          {template.basePrice > 0 ? (
                            <>
                              R$ {template.basePrice.toLocaleString('pt-BR')}
                              <span className="text-lg font-normal text-gray-600">{template.priceLabel}</span>
                            </>
                          ) : (
                            <span className="text-lg font-normal text-gray-600">{template.priceLabel}</span>
                          )}
                        </div>
                        {template.franchise && (
                          <p className="text-sm text-gray-500 mt-1">Franquia: {template.franchise}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Valores adicionais:</h4>
                      {template.additionalValues && (
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Nível 1: R$ {template.additionalValues.nivel1.toFixed(2)}</p>
                          <p>Nível 2: R$ {template.additionalValues.nivel2.toFixed(2)}</p>
                          <p>Massivos: R$ {template.additionalValues.massivos.toFixed(2)}</p>
                          <p>Vendas Receptivas: {template.additionalValues.vendasReceptivas}</p>
                        </div>
                      )}
                      {template.perCall && (
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Nível 1: R$ {template.perCall.nivel1.toFixed(2)}</p>
                          <p>Nível 2: R$ {template.perCall.nivel2.toFixed(2)}</p>
                          <p>Massivos: R$ {template.perCall.massivos.toFixed(2)}</p>
                          <p>Vendas Receptivas: {template.perCall.vendasReceptivas}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button 
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedTemplate?.id === template.id ? 'Selecionado' : 'Quero este plano'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
                    placeholder="Digite o nome da empresa"
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
                    placeholder="Digite o nome do contato"
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
                    placeholder="exemplo@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
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
                    className="input min-h-[80px]"
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customizações</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recursos Adicionais
                  </label>
                  <textarea
                    value={customizations.additionalFeatures}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, additionalFeatures: e.target.value }))}
                    className="input min-h-[80px]"
                    placeholder="Descreva recursos extras ou personalizações"
                  />
                </div>
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
                    Observações
                  </label>
                  <textarea
                    value={customizations.observations}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, observations: e.target.value }))}
                    className="input min-h-[80px]"
                    placeholder="Observações importantes"
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

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerar Proposta</h2>
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{selectedTemplate.icon} {selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        {selectedTemplate.basePrice > 0 ? (
                          <>R$ {selectedTemplate.basePrice.toLocaleString('pt-BR')}{selectedTemplate.priceLabel}</>
                        ) : (
                          selectedTemplate.priceLabel
                        )}
                      </span>
                      {customizations.discount > 0 && selectedTemplate.basePrice > 0 && (
                        <span className="ml-2 text-sm text-green-600">
                          (-{customizations.discount}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={generateProposal}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Gerar e Baixar Proposta</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Selecione um plano para gerar a proposta</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}