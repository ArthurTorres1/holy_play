// API para gerenciar configurações da home
import { http } from '../utils/api';

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
      return await http.get('api/home/configurations');
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
      return await http.get(`api/home/configurations/${sectionId}`);
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
      return await http.post('api/home/configurations', { body: config, auth: true });
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
      return await http.put(`api/home/configurations/${sectionId}`, { body: config, auth: true });
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
      await http.delete(`api/home/configurations/${sectionId}`, { auth: true });
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
      return await http.post('api/home/configurations/initialize', { auth: true });
    } catch (error) {
      console.error('Erro ao inicializar configurações padrão:', error);
      throw error;
    }
  }
}

export const homeConfigApi = new HomeConfigApi();
