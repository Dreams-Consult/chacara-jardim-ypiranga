#!/usr/bin/env node

/**
 * Script para gerar planilha Excel de exemplo para importação de loteamentos
 * 
 * Uso:
 *   node scripts/generate-excel-template.js
 * 
 * Gera o arquivo: template-importacao-loteamento.xlsx
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('📊 Gerando planilha Excel de exemplo...\n');

// Criar novo workbook
const workbook = XLSX.utils.book_new();

// ========================================
// ABA 1: Info
// ========================================
const infoData = [
  ['Nome do Loteamento', 'Loteamento Jardim das Flores'],
  [],
  ['📝 Instruções:', ''],
  ['- Esta aba contém o nome do loteamento', ''],
  ['- Não altere a estrutura desta aba', ''],
  ['- Mantenha "Nome do Loteamento" na célula A1', ''],
];

const infoSheet = XLSX.utils.aoa_to_sheet(infoData);

// Definir larguras das colunas
infoSheet['!cols'] = [
  { wch: 30 },
  { wch: 40 }
];

XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

// ========================================
// ABA 2: Quadra A - Lotes Disponíveis
// ========================================
const quadraAData = [
  ['Número', 'Status', 'Preço', 'Área', 'Descrição', 'Características'],
  ['01', 'disponível', 50000, 250, 'Lote de esquina', 'Esquina, Frente norte'],
  ['02', 'disponível', 45000, 240, 'Lote padrão', 'Meio de quadra'],
  ['03', 'disponível', 48000, 260, 'Lote amplo', 'Frente sul'],
  ['04', 'disponível', 47000, 240, 'Lote comercial', 'Acesso principal'],
  ['05', 'disponível', 52000, 270, 'Próximo à entrada', 'Acesso fácil'],
  ['06', 'disponível', 55000, 280, 'Lote privilegiado', 'Frente principal, Vista panorâmica'],
  ['07', 'disponível', 50000, 250, 'Lote residencial', 'Localização central'],
  ['08', 'disponível', 46000, 235, 'Lote padrão', ''],
  ['09', 'disponível', 49000, 245, 'Lote familiar', 'Área tranquila'],
  ['10', 'disponível', 53000, 265, 'Lote de esquina', 'Esquina, Duas frentes'],
];

const quadraASheet = XLSX.utils.aoa_to_sheet(quadraAData);

// Definir larguras das colunas
quadraASheet['!cols'] = [
  { wch: 8 },  // Número
  { wch: 12 }, // Status
  { wch: 10 }, // Preço
  { wch: 8 },  // Área
  { wch: 20 }, // Descrição
  { wch: 35 }  // Características
];

XLSX.utils.book_append_sheet(workbook, quadraASheet, 'Quadra A');

// ========================================
// ABA 3: Quadra B - Lotes Disponíveis
// ========================================
const quadraBData = [
  ['Número', 'Status', 'Preço', 'Área', 'Descrição', 'Características'],
  ['01', 'disponível', 55000, 280, 'Lote amplo', 'Frente principal'],
  ['02', 'disponível', 52000, 270, 'Boa localização', 'Meio de quadra'],
  ['03', 'disponível', 50000, 250, 'Próximo à praça', 'Vista privilegiada'],
  ['04', 'disponível', 48000, 240, 'Lote padrão', ''],
  ['05', 'disponível', 53000, 260, 'Esquina dupla', 'Esquina, Avenida'],
  ['06', 'disponível', 51000, 255, 'Lote familiar', 'Área residencial'],
  ['07', 'disponível', 49000, 245, 'Lote comercial', 'Ponto estratégico'],
  ['08', 'disponível', 54000, 275, 'Lote de esquina', 'Esquina, Frente leste'],
];

const quadraBSheet = XLSX.utils.aoa_to_sheet(quadraBData);

// Definir larguras das colunas
quadraBSheet['!cols'] = [
  { wch: 8 },  // Número
  { wch: 12 }, // Status
  { wch: 10 }, // Preço
  { wch: 8 },  // Área
  { wch: 20 }, // Descrição
  { wch: 25 }  // Características
];

XLSX.utils.book_append_sheet(workbook, quadraBSheet, 'Quadra B');

// ========================================
// ABA 4: Instruções
// ========================================
const instrucoesData = [
  ['INSTRUÇÕES PARA USO DA PLANILHA'],
  [],
  ['1. ESTRUTURA OBRIGATÓRIA:'],
  ['   • Aba "Info" deve conter o nome do loteamento'],
  ['   • Demais abas representam quadras (nome da aba = nome da quadra)'],
  ['   • Primeira linha de cada quadra deve conter os cabeçalhos'],
  [],
  ['2. COLUNAS OBRIGATÓRIAS:'],
  ['   • Número ou Lote: Número do lote'],
  ['   • Status: disponível, reservado, vendido ou bloqueado'],
  ['   • Preço: Valor do lote (pode usar R$ 50.000,00 ou 50000)'],
  ['   • Área: Tamanho em m²'],
  [],
  ['3. COLUNAS OPCIONAIS:'],
  ['   • Descrição: Texto descritivo do lote'],
  ['   • Características: Lista separada por vírgulas'],
  [],
  ['4. VALORES ACEITOS PARA STATUS:'],
  ['   • Disponível: disponivel, disponível, livre, available'],
  ['   • Reservado: reservado, reserved'],
  ['   • Vendido: vendido, sold'],
  ['   • Bloqueado: bloqueado, blocked'],
  [],
  ['5. FORMATAÇÃO DE VALORES:'],
  ['   • Preço: Aceita 50000, R$ 50.000,00, 50.000,00'],
  ['   • Área: Aceita 250, 250.5, 250,5 m²'],
  [],
  ['6. LOTES COM RESERVAS OU VENDAS:'],
  ['   Se quiser importar lotes já reservados/vendidos, adicione estas colunas:'],
  ['   • Cliente: Nome completo (obrigatório)'],
  ['   • Email: Email do cliente (obrigatório)'],
  ['   • Telefone: Telefone com DDD (obrigatório)'],
  ['   • CPF: CPF do cliente (opcional)'],
  ['   • Endereço: Endereço completo (opcional)'],
  ['   • Pagamento: dinheiro, financiamento ou parcelado (obrigatório)'],
  ['   • Observações: Notas adicionais (opcional)'],
  [],
  ['7. COMO IMPORTAR:'],
  ['   • Acesse /admin/import-map no sistema'],
  ['   • Selecione "Planilha Excel"'],
  ['   • Faça upload deste arquivo'],
  ['   • Revise o JSON gerado'],
  ['   • Clique em "Importar Loteamento"'],
  [],
  ['8. DICAS IMPORTANTES:'],
  ['   • Teste primeiro com poucos lotes para validar a estrutura'],
  ['   • Use sempre os mesmos nomes de colunas (case-insensitive)'],
  ['   • Status "disponível" é o padrão para lotes sem reserva'],
  ['   • Revise o JSON gerado antes de importar'],
  ['   • Mantenha backup da planilha original'],
  ['   • Você pode adicionar quantas quadras quiser (uma aba por quadra)'],
  [],
  ['9. ESTE MODELO:'],
  ['   • Quadra A: 10 lotes disponíveis'],
  ['   • Quadra B: 8 lotes disponíveis'],
  ['   • Todos prontos para customização'],
  [],
  ['Para mais informações, consulte: EXCEL_IMPORT_GUIDE.md'],
];

const instrucoesSheet = XLSX.utils.aoa_to_sheet(instrucoesData);

// Definir largura da coluna
instrucoesSheet['!cols'] = [{ wch: 80 }];

XLSX.utils.book_append_sheet(workbook, instrucoesSheet, 'Instruções');

// ========================================
// Salvar arquivo
// ========================================
const outputPath = path.join(process.cwd(), 'template-importacao-loteamento.xlsx');

try {
  XLSX.writeFile(workbook, outputPath);
  console.log('✅ Planilha gerada com sucesso!');
  console.log(`📁 Arquivo: ${outputPath}`);
  console.log('\n📊 Estrutura da planilha:');
  console.log('   • Aba "Info" - Nome do loteamento');
  console.log('   • Aba "Quadra A" - 10 lotes disponíveis');
  console.log('   • Aba "Quadra B" - 8 lotes disponíveis');
  console.log('   • Aba "Instruções" - Guia de uso');
  console.log('\n✨ Modelo simplificado: Todos os lotes estão disponíveis');
  console.log('🚀 Use esta planilha como base para importar seus loteamentos!');
} catch (error) {
  console.error('❌ Erro ao gerar planilha:', error);
  process.exit(1);
}
