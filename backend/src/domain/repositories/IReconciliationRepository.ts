export interface ReconciliationRecordEntity {
  id?: string;
  createdAt?: Date;
  moduleCapacityLiters: number;
  initialPressureBar: number;
  initialTempK: number;
  finalPressureBar: number;
  finalTempK: number;
  calculatedMassKg: number;
  calculatedVolumeSm3: number;
  saleVolumeSm3?: number | null;
}

export interface IReconciliationRepository {
  save(record: ReconciliationRecordEntity): Promise<ReconciliationRecordEntity>;
  findById(id: string): Promise<ReconciliationRecordEntity | null>;
  findAll(): Promise<ReconciliationRecordEntity[]>;
  updateSaleVolume(id: string, saleVolumeSm3: number): Promise<ReconciliationRecordEntity>;
}
