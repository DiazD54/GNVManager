import { PrismaClient } from '@prisma/client';
import { IReconciliationRepository, ReconciliationRecordEntity } from '../../domain/repositories/IReconciliationRepository';

const prisma = new PrismaClient();

export class PrismaReconciliationRepository implements IReconciliationRepository {
  
  async save(record: ReconciliationRecordEntity): Promise<ReconciliationRecordEntity> {
    const saved = await prisma.reconciliationRecord.create({
      data: {
        moduleCapacityLiters: record.moduleCapacityLiters,
        initialPressureBar: record.initialPressureBar,
        initialTempK: record.initialTempK,
        finalPressureBar: record.finalPressureBar,
        finalTempK: record.finalTempK,
        calculatedMassKg: record.calculatedMassKg,
        calculatedVolumeSm3: record.calculatedVolumeSm3,
        saleVolumeSm3: record.saleVolumeSm3
      }
    });
    
    return saved as ReconciliationRecordEntity;
  }

  async findById(id: string): Promise<ReconciliationRecordEntity | null> {
    const record = await prisma.reconciliationRecord.findUnique({
      where: { id }
    });
    return record ? (record as ReconciliationRecordEntity) : null;
  }

  async findAll(): Promise<ReconciliationRecordEntity[]> {
    const records = await prisma.reconciliationRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return records as ReconciliationRecordEntity[];
  }

  async updateSaleVolume(id: string, saleVolumeSm3: number): Promise<ReconciliationRecordEntity> {
    const updated = await prisma.reconciliationRecord.update({
      where: { id },
      data: { saleVolumeSm3 }
    });
    return updated as ReconciliationRecordEntity;
  }
}
