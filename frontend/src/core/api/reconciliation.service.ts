import axios from 'axios';

export interface ReconciliationRecord {
  id: string;
  createdAt: string;
  moduleCapacityLiters: number;
  initialPressureBar: number;
  initialTempK: number;
  finalPressureBar: number;
  finalTempK: number;
  calculatedMassKg: number;
  calculatedVolumeSm3: number;
  saleVolumeSm3?: number | null;
}

export interface CreateReconciliationDTO {
  moduleCapacityLiters: number;
  initialPressureBar: number;
  initialTempK: number;
  finalPressureBar: number;
  finalTempK: number;
  calculatedMassKg: number;
  calculatedVolumeSm3: number;
}

export class AxiosReconciliationService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  async saveRecord(data: CreateReconciliationDTO): Promise<ReconciliationRecord> {
    const response = await axios.post(`${this.baseURL}/reconciliation`, data);
    return response.data.data;
  }

  async getHistory(): Promise<ReconciliationRecord[]> {
    const response = await axios.get(`${this.baseURL}/reconciliation`);
    return response.data.data;
  }

  async updateSaleVolume(id: string, saleVolumeSm3: number): Promise<ReconciliationRecord> {
    const response = await axios.patch(`${this.baseURL}/reconciliation/${id}/sale`, { saleVolumeSm3 });
    return response.data.data;
  }
}

export const reconciliationService = new AxiosReconciliationService();
