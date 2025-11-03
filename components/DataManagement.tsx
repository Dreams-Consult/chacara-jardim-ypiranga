'use client';

import React, { useState } from 'react';
import { getMaps, getLots, saveMap, saveLot } from '@/lib/storage';
import { Map, Lot } from '@/types';

export default function DataManagement() {
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const data = {
      maps: getMaps(),
      lots: getLots(),
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chacara-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setMessage('✅ Dados exportados com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      
      if (!data.maps || !data.lots) {
        setMessage('❌ Formato de dados inválido');
        return;
      }

      // Importar mapas
      data.maps.forEach((map: Map) => {
        saveMap(map);
      });

      // Importar lotes
      data.lots.forEach((lot: Lot) => {
        saveLot(lot);
      });

      setMessage(`✅ Importados ${data.maps.length} mapas e ${data.lots.length} lotes!`);
      setImportData('');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erro ao importar:', error);
      setMessage('❌ Erro ao importar dados. Verifique o formato JSON.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados! Deseja continuar?')) {
      if (confirm('Tem certeza? Esta ação não pode ser desfeita!')) {
        localStorage.clear();
        setMessage('✅ Todos os dados foram apagados');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="text-blue-700 hover:text-blue-900 font-medium hover:underline mb-2 transition-colors"
        >
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Dados</h1>
        <p className="text-gray-700 mt-2">
          Exporte e importe dados entre diferentes ambientes (localhost e GitHub Pages)
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'}`}>
          {message}
        </div>
      )}

      {/* Exportar Dados */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📤 Exportar Dados</h2>
        <p className="text-gray-700 mb-4">
          Baixe todos os mapas e lotes em um arquivo JSON para backup ou transferência.
        </p>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
        >
          Exportar Todos os Dados
        </button>
      </div>

      {/* Importar Dados */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📥 Importar Dados</h2>
        <p className="text-gray-700 mb-4">
          Importe dados de um arquivo JSON exportado anteriormente.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Selecionar Arquivo JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Ou Cole o JSON Aqui
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={10}
              placeholder='{"maps": [...], "lots": [...]}'
            />
          </div>

          <button
            onClick={handleImport}
            disabled={!importData}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-all hover:shadow-lg"
          >
            Importar Dados
          </button>
        </div>
      </div>

      {/* Limpar Dados */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold text-red-900 mb-4">🗑️ Limpar Todos os Dados</h2>
        <p className="text-red-800 mb-4">
          ⚠️ <strong>CUIDADO:</strong> Esta ação irá apagar permanentemente todos os mapas e lotes!
        </p>
        <button
          onClick={handleClearAll}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-md transition-all hover:shadow-lg"
        >
          Apagar Todos os Dados
        </button>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Como Usar</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>
            <strong>No ambiente local (localhost):</strong> Crie seus mapas e lotes, depois clique em &ldquo;Exportar Todos os Dados&rdquo;
          </li>
          <li>
            <strong>No GitHub Pages:</strong> Acesse esta mesma página e clique em &ldquo;Importar Dados&rdquo;, depois selecione o arquivo exportado
          </li>
          <li>
            Os dados serão salvos no localStorage do navegador e ficarão disponíveis para uso
          </li>
        </ol>
      </div>

      {/* URLs Corretas */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-3">🔗 URLs Corretas do GitHub Pages</h3>
        <p className="text-yellow-800 mb-3">
          Para acessar o site no GitHub Pages, use as URLs com o prefixo <code className="bg-yellow-100 px-2 py-1 rounded text-sm">/chacara-jardim-ypiranga</code>:
        </p>
        <ul className="list-disc list-inside space-y-2 text-yellow-800 text-sm">
          <li>
            <strong>Página Inicial:</strong><br/>
            <code className="bg-yellow-100 px-2 py-1 rounded block mt-1">
              https://dreams-consult.github.io/chacara-jardim-ypiranga/
            </code>
          </li>
          <li>
            <strong>Admin - Mapas:</strong><br/>
            <code className="bg-yellow-100 px-2 py-1 rounded block mt-1">
              https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/maps/
            </code>
          </li>
          <li>
            <strong>Admin - Lotes:</strong><br/>
            <code className="bg-yellow-100 px-2 py-1 rounded block mt-1">
              https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/lot-management/?mapId=1762192028364
            </code>
          </li>
          <li>
            <strong>Admin - Dados:</strong><br/>
            <code className="bg-yellow-100 px-2 py-1 rounded block mt-1">
              https://dreams-consult.github.io/chacara-jardim-ypiranga/admin/data/
            </code>
          </li>
        </ul>
        <p className="text-yellow-800 mt-3 text-sm">
          ⚠️ <strong>Importante:</strong> As URLs SEM o prefixo <code className="bg-yellow-100 px-1 rounded">/chacara-jardim-ypiranga</code> resultarão em erro 404.
        </p>
      </div>
    </div>
  );
}
