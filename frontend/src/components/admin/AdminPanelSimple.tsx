import React from 'react';

const AdminPanelSimple: React.FC = () => {
  // Valores hardcoded temporariamente para teste
  const libraryId = '495345';
  const apiKey = '4df82cca-1d1f-4d44-b909b4b86c37-6c56-42d0';
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Painel de Administrador</h1>
      <p className="text-gray-300">Painel funcionando! Agora vamos testar a API do Bunny.net.</p>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Status da Configuração</h2>
        <div className="space-y-2">
          <p>Library ID: <span className="font-mono text-blue-400">{libraryId}</span></p>
          <p>API Key: <span className="text-green-400">Configurado ✅</span></p>
        </div>
        
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <p className="text-sm text-gray-300">
            <strong>Debug das variáveis de ambiente:</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            VITE_BUNNY_LIBRARY_ID: {import.meta.env.VITE_BUNNY_LIBRARY_ID || 'undefined'}
          </p>
          <p className="text-xs text-gray-400">
            VITE_BUNNY_API_KEY: {import.meta.env.VITE_BUNNY_API_KEY ? 'definido' : 'undefined'}
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Teste da API</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
                headers: {
                  'AccessKey': apiKey,
                  'Content-Type': 'application/json',
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                alert(`Sucesso! Encontrados ${data.totalItems} vídeos na sua biblioteca.`);
              } else {
                alert(`Erro: ${response.status} - ${response.statusText}`);
              }
            } catch (error) {
              alert(`Erro de conexão: ${error}`);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
        >
          Testar Conexão com Bunny.net
        </button>
      </div>
    </div>
  );
};

export default AdminPanelSimple;
