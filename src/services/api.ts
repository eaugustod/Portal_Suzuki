/**
 * Service Layer para comunicação do Portal Suzuki com a API Backend Node/Express e banco Protheus (SQL Server).
 * Implementa fallback automático para dados mockados em caso de falha de conexão ou ambiente offline.
 */

/// <reference types="vite/client" />

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export interface HealthStatus {
  status: 'ok' | 'error';
  service: string;
  database: 'connected' | 'disconnected' | 'unknown';
  timestamp: string;
}

export const apiService = {
  /**
   * Verifica o status de saúde da API e da conexão com o SQL Server Protheus
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('[apiService] API indisponível, utilizando modo fallback local:', error);
      return {
        status: 'error',
        service: 'Portal Suzuki (Local Fallback)',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Utilitário genérico para chamadas GET com tratamento de erro
   */
  async get<T>(endpoint: string, fallbackData: T): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Erro na chamada ${endpoint}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[apiService] Erro ao buscar ${endpoint}, utilizando fallback:`, err);
      return fallbackData;
    }
  },

  /**
   * Utilitário genérico para chamadas POST com tratamento de erro
   */
  async post<T>(endpoint: string, data: any, fallbackResult: T): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Erro no POST ${endpoint}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[apiService] Erro ao enviar ${endpoint}, operando localmente:`, err);
      return fallbackResult;
    }
  }
};
