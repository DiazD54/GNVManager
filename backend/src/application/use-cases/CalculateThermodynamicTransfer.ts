import { ThermodynamicState, TransferResult, STANDARD_GAS_COMPOSITION, UNIVERSAL_GAS_CONSTANT, STANDARD_PRESSURE_BAR, STANDARD_TEMPERATURE_K } from '../../domain/entities/Thermodynamics';

// Capa 2: Use Cases (Application Business Rules)
// Orquesta las entidades para resolver un caso de uso específico de la aplicación.
export class CalculateThermodynamicTransferUseCase {
  
  public execute(initial: ThermodynamicState, final: ThermodynamicState, volumeLiters: number): TransferResult {
    const initialMass = this.calculateMass(initial.pressureBar, initial.temperatureK, volumeLiters);
    const finalMass = this.calculateMass(final.pressureBar, final.temperatureK, volumeLiters);
    
    const massTransferred = Math.max(0, finalMass - initialMass);
    const volumeTransferred = this.calculateStandardVolume(massTransferred);

    return {
      massTransferredKg: massTransferred,
      volumeTransferredSm3: volumeTransferred,
      initialMassKg: initialMass,
      finalMassKg: finalMass
    };
  }

  private calculateZFactor(pressureBar: number, temperatureK: number): number {
    if (pressureBar <= 0) return 1.0;
    
    const Pr = pressureBar / STANDARD_GAS_COMPOSITION.criticalPressure;
    const Tr = temperatureK / STANDARD_GAS_COMPOSITION.criticalTemperature;

    const term1 = 3.52 * Pr / Math.exp(2.26 * Tr);
    const term2 = 0.274 * Math.pow(Pr, 2) / Math.exp(1.878 * Tr);

    return 1 - term1 + term2;
  }

  private calculateMass(pressureBar: number, temperatureK: number, volumeLiters: number): number {
    if (pressureBar <= 0) return 0;
    const zFactor = this.calculateZFactor(pressureBar, temperatureK);
    const massGrams = (pressureBar * volumeLiters * STANDARD_GAS_COMPOSITION.molarMass) / (zFactor * UNIVERSAL_GAS_CONSTANT * temperatureK);
    return massGrams / 1000;
  }

  private calculateStandardVolume(massKg: number): number {
    const zStd = this.calculateZFactor(STANDARD_PRESSURE_BAR, STANDARD_TEMPERATURE_K);
    const massGrams = massKg * 1000;
    const volumeLiters = (massGrams * zStd * UNIVERSAL_GAS_CONSTANT * STANDARD_TEMPERATURE_K) / (STANDARD_PRESSURE_BAR * STANDARD_GAS_COMPOSITION.molarMass);
    return volumeLiters / 1000;
  }
}
