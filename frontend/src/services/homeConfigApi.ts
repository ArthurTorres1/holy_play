// API para gerenciar configurações da home
import { apiFetch } from '../utils/api';

export interface HomeConfigurationResponse {
  sectionId: string;
  sectionName: string;
  videoIds: string[];
  maxVideos: number;
  updatedAt: string;
}

export interface HomeConfigurationRequest {
  sectionId: string;
  sectionName: string;
  videoIds: string[];
  maxVideos: number;
}

class HomeConfigApi {
  
  /**
   * Busca todas as configurações das seções
   */
  async getAllConfigurations(): Promise<HomeConfigurationResponse[]> {
    try {
      const response = await apiFetch('api/home/configurations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar configurações: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configurações da home:', error);
      throw error;
    }
  }

  /**
   * Busca configuração de uma seção específica
   */
  async getConfiguration(sectionId: string): Promise<HomeConfigurationResponse | null> {
    try {
      const response = await apiFetch(`api/home/configurations/${sectionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar configuração: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar configuração da seção ${sectionId}:`, error);
      throw error;
    }
  }

  /**
   * Salva configuração de uma seção
   */
  async saveConfiguration(config: HomeConfigurationRequest): Promise<HomeConfigurationResponse> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login como administrador.');
      }
      
      console.log('🔐 Enviando requisição com token:', token.substring(0, 20) + '...');
      
      const response = await apiFetch('api/home/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar configuração: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  }

  /**
   * Atualiza configuração de uma seção específica
   */
  async updateConfiguration(sectionId: string, config: HomeConfigurationRequest): Promise<HomeConfigurationResponse> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login como administrador.');
      }
      
      const response = await apiFetch(`api/home/configurations/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar configuração: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar configuração da seção ${sectionId}:`, error);
      throw error;
    }
  }

  /**
   * Remove configuração de uma seção
   */
  async deleteConfiguration(sectionId: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login como administrador.');
      }
      
      const response = await apiFetch(`api/home/configurations/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar configuração: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erro ao deletar configuração da seção ${sectionId}:`, error);
      throw error;
    }
  }

  /**
   * Inicializa configurações padrão
   */
  async initializeDefaults(): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login como administrador.');
      }
      
      const response = await apiFetch('api/home/configurations/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao inicializar configurações: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Erro ao inicializar configurações padrão:', error);
      throw error;
    }
  }
}

export const homeConfigApi = new HomeConfigApi();
