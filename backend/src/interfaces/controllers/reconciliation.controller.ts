import { Request, Response } from 'express';
import { z } from 'zod';
import { SaveReconciliationRecordUseCase } from '../../application/use-cases/SaveReconciliationRecord';
import { UpdateSaleVolumeUseCase } from '../../application/use-cases/UpdateSaleVolume';
import { PrismaReconciliationRepository } from '../../infrastructure/database/PrismaReconciliationRepository';

const reconciliationSchema = z.object({
  moduleCapacityLiters: z.number().positive(),
  initialPressureBar: z.number().nonnegative(),
  initialTempK: z.number().positive(),
  finalPressureBar: z.number().nonnegative(),
  finalTempK: z.number().positive(),
  calculatedMassKg: z.number().nonnegative(),
  calculatedVolumeSm3: z.number().nonnegative(),
  saleVolumeSm3: z.number().nonnegative().optional().nullable()
});

export class ReconciliationController {
  private saveUseCase: SaveReconciliationRecordUseCase;
  private updateSaleUseCase: UpdateSaleVolumeUseCase;
  private repository: PrismaReconciliationRepository;

  constructor() {
    this.repository = new PrismaReconciliationRepository();
    this.saveUseCase = new SaveReconciliationRecordUseCase(this.repository);
    this.updateSaleUseCase = new UpdateSaleVolumeUseCase(this.repository);
  }

  public saveRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = reconciliationSchema.parse(req.body);
      const savedRecord = await this.saveUseCase.execute(validatedData);
      
      res.status(201).json({
        success: true,
        data: savedRecord
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: 'Datos inválidos', details: error.errors });
        return;
      }
      console.error(error);
      res.status(500).json({ success: false, error: 'Error interno guardando la conciliación' });
    }
  };

  public getHistory = async (_req: Request, res: Response): Promise<void> => {
    try {
      const records = await this.repository.findAll();
      res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error obteniendo historial' });
    }
  }

  public updateSale = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { saleVolumeSm3 } = z.object({ saleVolumeSm3: z.number().nonnegative() }).parse(req.body);
      
      const updatedRecord = await this.updateSaleUseCase.execute(id, saleVolumeSm3);
      
      res.status(200).json({
        success: true,
        data: updatedRecord
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: 'Datos inválidos', details: error.errors });
        return;
      }
      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ success: false, error: 'Error actualizando venta' });
    }
  }
}
