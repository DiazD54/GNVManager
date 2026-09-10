import { Request, Response } from 'express';
import { z } from 'zod';
import { CalculateThermodynamicTransferUseCase } from '../../application/use-cases/CalculateThermodynamicTransfer';

// Capa 3: Interface Adapters (Controllers)
// Valida entradas del mundo exterior (HTTP/JSON) y las traduce para la Capa de Aplicación.

const thermodynamicInputSchema = z.object({
  initial: z.object({
    pressureBar: z.number().nonnegative(),
    temperatureK: z.number().positive(),
  }),
  final: z.object({
    pressureBar: z.number().nonnegative(),
    temperatureK: z.number().positive(),
  }),
  volumeLiters: z.number().positive(),
});

export class ThermodynamicController {
  private calculateUseCase: CalculateThermodynamicTransferUseCase;

  constructor() {
    this.calculateUseCase = new CalculateThermodynamicTransferUseCase();
  }

  public calculateTransfer = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Zod filtra cualquier dato sucio o inyección
      const validatedData = thermodynamicInputSchema.parse(req.body);

      // 2. Inyectamos los DTOs limpios al Caso de Uso (Regla de Aplicación)
      const result = this.calculateUseCase.execute(
        validatedData.initial,
        validatedData.final,
        validatedData.volumeLiters
      );

      // 3. Traducimos la respuesta pura del dominio a formato JSON/HTTP
      res.status(200).json({
        success: true,
        data: result
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: 'Datos de entrada inválidos', details: error.errors });
        return;
      }
      console.error(error);
      res.status(500).json({ success: false, error: 'Error interno calculando termodinámica' });
    }
  };
}
