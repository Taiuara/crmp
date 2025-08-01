'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

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
    id: 'plano-personalizado',
    name: 'Plano Personalizado',
    description: 'Configure um plano personalizado de acordo com as necessidades específicas do cliente',
    features: [
      'Plano totalmente customizável',
      'Franquia personalizada',
      'Valores configuráveis',
      'Atendimento sob medida'
    ],
    basePrice: 0,
    priceLabel: 'Personalizado',
    category: 'atendimento',
    icon: '⚙️',
    franchise: 'A definir',
    additionalValues: {
      nivel1: 0,
      nivel2: 0,
      massivos: 0,
      vendasReceptivas: 'A definir'
    }
  },
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
  const [customPlan, setCustomPlan] = useState({
    monthlyValue: 0,
    franchise: '',
    nivel1: 0,
    nivel2: 0,
    massivos: 0,
    vendasReceptivas: '',
  });

  const generateProposal = async () => {
    if (!selectedTemplate) {
      toast.error('Selecione um plano primeiro');
      return;
    }

    if (!clientData.companyName || !clientData.contactName) {
      toast.error('Preencha pelo menos o nome da empresa e contato');
      return;
    }

    // Validações específicas para plano personalizado
    if (selectedTemplate.id === 'plano-personalizado') {
      if (!customPlan.monthlyValue || !customPlan.franchise) {
        toast.error('Preencha todos os campos obrigatórios do plano personalizado');
        return;
      }
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Usar dados do plano personalizado se selecionado
      const planData = selectedTemplate.id === 'plano-personalizado' ? {
        ...selectedTemplate,
        basePrice: customPlan.monthlyValue,
        franchise: customPlan.franchise,
        additionalValues: {
          nivel1: customPlan.nivel1,
          nivel2: customPlan.nivel2,
          massivos: customPlan.massivos,
          vendasReceptivas: customPlan.vendasReceptivas
        }
      } : selectedTemplate;
      
      // Configurações de cores
      const primaryColor: [number, number, number] = [31, 182, 255]; // #1FB6FF
      const secondaryColor: [number, number, number] = [107, 70, 242]; // #6B46F2
      const darkGray: [number, number, number] = [64, 64, 64];
      const lightGray: [number, number, number] = [128, 128, 128];

      // Header com logo (simulado)
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      // Logo e título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PingDesk', 20, 17);

      // Data
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 60, 35);

      // Título da proposta
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROPOSTA COMERCIAL', 20, 45);

      // Subtítulo com plano selecionado
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(14);
      pdf.text(planData.name, 20, 58);

      let yPosition = 70;

      // Seção dados do cliente
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DADOS DO CLIENTE', 20, yPosition);
      
      yPosition += 8;
      pdf.setDrawColor(...lightGray);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 12;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Empresa: ${clientData.companyName}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Contato: ${clientData.contactName}`, 20, yPosition);
      yPosition += 6;
      if (clientData.email) {
        pdf.text(`E-mail: ${clientData.email}`, 20, yPosition);
        yPosition += 6;
      }
      if (clientData.phone) {
        pdf.text(`Telefone: ${clientData.phone}`, 20, yPosition);
        yPosition += 6;
      }
      if (clientData.address) {
        const addressLines = pdf.splitTextToSize(`Endereço: ${clientData.address}`, pageWidth - 40);
        pdf.text(addressLines, 20, yPosition);
        yPosition += addressLines.length * 5;
      }

      yPosition += 8;

      // Características do plano - agora como primeira seção após dados do cliente
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CARACTERÍSTICAS', 20, yPosition);
      
      yPosition += 8;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 12;

      // Nome do plano como subtítulo
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(planData.name, 20, yPosition);
      yPosition += 8;

      pdf.setTextColor(...darkGray);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const descriptionLines = pdf.splitTextToSize(planData.description, pageWidth - 40);
      pdf.text(descriptionLines, 20, yPosition);
      yPosition += descriptionLines.length * 5 + 6;

      // Para plano personalizado, mostrar configurações customizadas
      if (selectedTemplate.id === 'plano-personalizado') {
        pdf.text(`• Valor Mensal: R$ ${customPlan.monthlyValue.toLocaleString('pt-BR')}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`• Franquia: ${customPlan.franchise}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`• Nível 1: R$ ${customPlan.nivel1.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`• Nível 2: R$ ${customPlan.nivel2.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`• Massivos: R$ ${customPlan.massivos.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`• Vendas Receptivas: ${customPlan.vendasReceptivas}`, 25, yPosition);
        yPosition += 6;
      } else {
        planData.features.forEach(feature => {
          pdf.text(`• ${feature}`, 25, yPosition);
          yPosition += 6;
        });
      }

      yPosition += 4;

      // Franquia
      if (planData.franchise) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`FRANQUIA INCLUÍDA: ${planData.franchise}`, 20, yPosition);
        yPosition += 10;
      }

      // Valores adicionais
      if (planData.additionalValues || planData.perCall) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('VALORES EXCEDENTES A FRANQUIA:', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        if (planData.additionalValues) {
          pdf.text(`• Nível 1: R$ ${planData.additionalValues.nivel1.toFixed(2)}`, 25, yPosition);
          yPosition += 6;
          pdf.text(`• Nível 2: R$ ${planData.additionalValues.nivel2.toFixed(2)}`, 25, yPosition);
          yPosition += 6;
          pdf.text(`• Massivos: R$ ${planData.additionalValues.massivos.toFixed(2)}`, 25, yPosition);
          yPosition += 6;
          pdf.text(`• Vendas Receptivas: ${planData.additionalValues.vendasReceptivas}`, 25, yPosition);
          yPosition += 8;
        }

        if (planData.perCall) {
          pdf.text('VALORES POR CHAMADO:', 25, yPosition);
          yPosition += 6;
          pdf.text(`• Nível 1: R$ ${planData.perCall.nivel1.toFixed(2)}`, 30, yPosition);
          yPosition += 6;
          pdf.text(`• Nível 2: R$ ${planData.perCall.nivel2.toFixed(2)}`, 30, yPosition);
          yPosition += 6;
          pdf.text(`• Massivos: R$ ${planData.perCall.massivos.toFixed(2)}`, 30, yPosition);
          yPosition += 6;
          pdf.text(`• Vendas Receptivas: ${planData.perCall.vendasReceptivas}`, 30, yPosition);
          yPosition += 8;
        }
      }

      // Recursos adicionais
      if (customizations.additionalFeatures) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RECURSOS ADICIONAIS:', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const additionalLines = pdf.splitTextToSize(customizations.additionalFeatures, pageWidth - 40);
        pdf.text(additionalLines, 20, yPosition);
        yPosition += additionalLines.length * 5 + 8;
      }

      // Seção de investimento
      pdf.setFillColor(245, 245, 245);
      pdf.rect(15, yPosition - 4, pageWidth - 30, 28, 'F');
      
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVESTIMENTO', 20, yPosition + 6);

      yPosition += 16;
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(10);

      if (planData.basePrice > 0) {
        const finalPrice = planData.basePrice * (1 - customizations.discount / 100);
        pdf.text(`Valor mensal: R$ ${planData.basePrice.toLocaleString('pt-BR')}`, 20, yPosition);
        yPosition += 6;
        
        if (customizations.discount > 0) {
          pdf.text(`Desconto: ${customizations.discount}%`, 20, yPosition);
          yPosition += 6;
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Valor final: R$ ${finalPrice.toLocaleString('pt-BR')}/mês`, 20, yPosition);
        }
      } else {
        pdf.text('Sem mensalidade fixa - Pagamento por chamado', 20, yPosition);
      }

      yPosition += 15;

      // Observações
      if (customizations.observations) {
        pdf.setTextColor(...darkGray);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('OBSERVAÇÕES:', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const observationLines = pdf.splitTextToSize(customizations.observations, pageWidth - 40);
        pdf.text(observationLines, 20, yPosition);
        yPosition += observationLines.length * 5 + 8;
      }

      // Validade
      if (customizations.validUntil) {
        pdf.setTextColor(...lightGray);
        pdf.setFontSize(9);
        pdf.text(`Proposta válida até: ${new Date(customizations.validUntil).toLocaleDateString('pt-BR')}`, 20, yPosition);
        yPosition += 8;
      }

      // Footer
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Proposta gerada pelo CRM PingDesk', 20, pageHeight - 8);
      pdf.text('www.pingdesk.com.br', pageWidth - 60, pageHeight - 8);

      // Salvar o PDF
      const fileName = `Proposta_${clientData.companyName}_${planData.name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

      toast.success('Proposta PDF gerada e baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar proposta PDF');
    }
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

            {selectedTemplate?.id === 'plano-personalizado' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuração do Plano Personalizado</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fixo Mensal (R$) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={customPlan.monthlyValue}
                        onChange={(e) => setCustomPlan(prev => ({ ...prev, monthlyValue: Number(e.target.value) }))}
                        className="input"
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Franquia *
                      </label>
                      <input
                        type="text"
                        value={customPlan.franchise}
                        onChange={(e) => setCustomPlan(prev => ({ ...prev, franchise: e.target.value }))}
                        className="input"
                        placeholder="1000 chamados"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Valores Adicionais (Excedente à Franquia)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nível 1 (R$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customPlan.nivel1}
                          onChange={(e) => setCustomPlan(prev => ({ ...prev, nivel1: Number(e.target.value) }))}
                          className="input"
                          placeholder="3.50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nível 2 (R$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customPlan.nivel2}
                          onChange={(e) => setCustomPlan(prev => ({ ...prev, nivel2: Number(e.target.value) }))}
                          className="input"
                          placeholder="4.50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Massivos (R$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customPlan.massivos}
                          onChange={(e) => setCustomPlan(prev => ({ ...prev, massivos: Number(e.target.value) }))}
                          className="input"
                          placeholder="1.50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Vendas Receptivas
                        </label>
                        <input
                          type="text"
                          value={customPlan.vendasReceptivas}
                          onChange={(e) => setCustomPlan(prev => ({ ...prev, vendasReceptivas: e.target.value }))}
                          className="input"
                          placeholder="50% do plano instalado"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerar Proposta</h2>
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{selectedTemplate.icon} {selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        {selectedTemplate.id === 'plano-personalizado' ? (
                          customPlan.monthlyValue > 0 ? (
                            <>R$ {customPlan.monthlyValue.toLocaleString('pt-BR')}/mês</>
                          ) : (
                            'Configure os valores'
                          )
                        ) : selectedTemplate.basePrice > 0 ? (
                          <>R$ {selectedTemplate.basePrice.toLocaleString('pt-BR')}{selectedTemplate.priceLabel}</>
                        ) : (
                          selectedTemplate.priceLabel
                        )}
                      </span>
                      {customizations.discount > 0 && (
                        selectedTemplate.id === 'plano-personalizado' ? 
                          customPlan.monthlyValue > 0 : 
                          selectedTemplate.basePrice > 0
                      ) && (
                        <span className="ml-2 text-sm text-green-600">
                          (-{customizations.discount}%)
                        </span>
                      )}
                    </div>
                    {selectedTemplate.id === 'plano-personalizado' && customPlan.franchise && (
                      <p className="text-sm text-gray-500 mt-1">Franquia: {customPlan.franchise}</p>
                    )}
                  </div>
                  <button
                    onClick={generateProposal}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Gerar Proposta PDF</span>
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