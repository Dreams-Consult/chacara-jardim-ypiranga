'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = '/api';

interface ImportResult {
  mapId: string;
  mapName: string;
  totalBlocks: number;
  totalLots: number;
}

interface UploadImageResult {
  message: string;
  mapId: string;
  imageType: string;
  width: number;
  height: number;
}

export default function ImportMapPage() {
  const router = useRouter();
  const [jsonContent, setJsonContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<ImportResult | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  const exampleJson = {
    name: "Loteamento Exemplo",
    imageUrl: "",
    imageType: "image/png",
    width: 800,
    height: 600,
    blocks: [
      {
        name: "Quadra A",
        description: "Primeira quadra do loteamento",
        lots: [
          {
            lotNumber: "01",
            status: "available",
            price: 50000,
            size: 300,
            description: "Lote de esquina",
            features: ["Esquina", "Frente norte"]
          },
          {
            lotNumber: "02",
            status: "available",
            price: 45000,
            size: 250,
            description: "Lote regular",
            features: []
          }
        ]
      },
      {
        name: "Quadra B",
        description: "Segunda quadra",
        lots: [
          {
            lotNumber: "01",
            status: "available",
            price: 60000,
            size: 350,
            description: "Lote maior",
            features: ["Vista privilegiada"]
          }
        ]
      }
    ]
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonContent(content);
      setError('');
      setSuccess(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonContent.trim()) {
      setError('Por favor, selecione um arquivo JSON ou cole o conteúdo');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess(null);

    try {
      // Validar JSON
      let data;
      try {
        data = JSON.parse(jsonContent);
      } catch (e) {
        setError('JSON inválido. Verifique a sintaxe do arquivo.');
        setIsUploading(false);
        return;
      }

      // Enviar para API
      const response = await axios.post(`${API_URL}/mapas/importar`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      console.log('[ImportMap] ✅ Importação bem-sucedida:', response.data);
      setSuccess(response.data);
      setJsonContent('');
    } catch (err: any) {
      console.error('[ImportMap] ❌ Erro na importação:', err);

      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.message || err.response.data?.error;
        setError(errorMessage || 'Erro ao importar dados');
      } else {
        setError('Erro ao processar arquivo. Verifique o formato e tente novamente.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseExample = () => {
    setJsonContent(JSON.stringify(exampleJson, null, 2));
    setShowExample(false);
    setError('');
    setSuccess(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    setImageFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleUploadImage = async () => {
    if (!imageFile || !success) return;

    setIsUploadingImage(true);
    setError('');

    try {
      // Converter imagem para base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;

        try {
          // Obter dimensões da imagem
          const img = new Image();
          img.onload = async () => {
            const width = img.width;
            const height = img.height;

            // Enviar para API
            const response = await axios.post(`${API_URL}/mapas/atualizar-imagem`, {
              mapId: success.mapId,
              imageUrl: base64Image,
              width,
              height,
            }, {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            });

            console.log('[ImportMap] ✅ Imagem atualizada:', response.data);
            setImageUploaded(true);
            setIsUploadingImage(false);
          };
          img.onerror = () => {
            setError('Erro ao processar imagem');
            setIsUploadingImage(false);
          };
          img.src = base64Image;
        } catch (err: any) {
          console.error('[ImportMap] ❌ Erro ao enviar imagem:', err);
          setError(err.response?.data?.error || 'Erro ao fazer upload da imagem');
          setIsUploadingImage(false);
        }
      };
      reader.onerror = () => {
        setError('Erro ao ler arquivo de imagem');
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      console.error('[ImportMap] ❌ Erro:', err);
      setError('Erro ao processar imagem');
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Importar Loteamento</h1>
        <p className="text-white/70">
          Faça upload de um arquivo JSON com os dados do mapa, quadras e lotes
        </p>
      </div>

      {/* Card de sucesso */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-300 mb-2">Importação Concluída!</h3>
              <p className="text-green-200 mb-4">O loteamento foi criado com sucesso.</p>
              <div className="bg-green-900/30 rounded-lg p-4 space-y-2 text-green-100">
                <p><span className="font-semibold">Mapa:</span> {success.mapName}</p>
                <p><span className="font-semibold">ID:</span> {success.mapId}</p>
                <p><span className="font-semibold">Quadras criadas:</span> {success.totalBlocks}</p>
                <p><span className="font-semibold">Lotes criados:</span> {success.totalLots}</p>
              </div>

              {/* Upload de imagem após importação */}
              {!imageUploaded && (
                <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Adicionar Imagem do Mapa (Opcional)
                  </h4>
                  <p className="text-blue-200 text-sm mb-3">
                    Faça upload de uma imagem do mapa do loteamento
                  </p>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isUploadingImage}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-500 file:text-white file:text-sm file:font-semibold hover:file:bg-blue-600 transition-colors disabled:opacity-50"
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full max-h-64 object-contain bg-gray-900 rounded-lg"
                        />
                      </div>
                    )}
                    {imageFile && !isUploadingImage && (
                      <button
                        onClick={handleUploadImage}
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Fazer Upload da Imagem
                      </button>
                    )}
                    {isUploadingImage && (
                      <div className="flex items-center justify-center gap-2 text-blue-300">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Enviando imagem...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {imageUploaded && (
                <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <p className="text-green-300 font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Imagem adicionada com sucesso!
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => router.push(`/admin/map-details?mapId=${success.mapId}`)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Ver Mapa
                </button>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setJsonContent('');
                    setImageFile(null);
                    setImagePreview('');
                    setImageUploaded(false);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                >
                  Importar Outro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card de erro */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-300 font-semibold">Erro na Importação</p>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Card de instruções */}
      <div className="bg-[var(--card-bg)] rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Como Usar</h2>
        <ol className="space-y-2 text-white/80">
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</span>
            <span>Prepare um arquivo JSON com os dados do loteamento</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</span>
            <span>Faça upload do arquivo ou cole o conteúdo JSON no campo abaixo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</span>
            <span>Clique em "Importar Loteamento" e aguarde o processamento</span>
          </li>
        </ol>
        <button
          onClick={() => setShowExample(!showExample)}
          className="mt-4 text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showExample ? 'Ocultar' : 'Ver'} Exemplo de JSON
        </button>
      </div>

      {/* Card de exemplo */}
      {showExample && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Exemplo de Arquivo JSON</h3>
            <button
              onClick={handleUseExample}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Usar Este Exemplo
            </button>
          </div>
          <pre className="bg-black rounded-lg p-4 overflow-x-auto text-sm text-green-400">
            {JSON.stringify(exampleJson, null, 2)}
          </pre>
          <div className="mt-4 text-white/70 text-sm space-y-1">
            <p><strong>Campos obrigatórios:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code className="text-blue-400">name</code>: Nome do mapa</li>
              <li><code className="text-blue-400">blocks</code>: Array de quadras (pelo menos 1)</li>
              <li><code className="text-blue-400">blocks[].name</code>: Nome da quadra</li>
              <li><code className="text-blue-400">lots[].lotNumber</code>: Número do lote</li>
              <li><code className="text-blue-400">lots[].price</code>: Preço do lote</li>
              <li><code className="text-blue-400">lots[].size</code>: Tamanho em m²</li>
            </ul>
          </div>
        </div>
      )}

      {/* Card de upload/editor */}
      <div className="bg-[var(--card-bg)] rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Upload do Arquivo</h2>
        
        {/* Input de arquivo */}
        <div className="mb-4">
          <label className="block text-white/80 font-semibold mb-2">
            Selecionar Arquivo JSON
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-blue-600 transition-colors"
          />
        </div>

        <div className="text-center text-white/50 font-semibold my-4">OU</div>

        {/* Editor de texto */}
        <div className="mb-4">
          <label className="block text-white/80 font-semibold mb-2">
            Colar Conteúdo JSON
          </label>
          <textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            placeholder='{"name": "Meu Loteamento", "blocks": [...]}'
            rows={15}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <p className="text-white/50 text-sm mt-2">
            Cole aqui o conteúdo do arquivo JSON ou edite o texto carregado
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={isUploading || !jsonContent.trim()}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Importar Loteamento
              </>
            )}
          </button>
          <button
            onClick={() => {
              setJsonContent('');
              setError('');
              setSuccess(null);
            }}
            disabled={isUploading}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}
