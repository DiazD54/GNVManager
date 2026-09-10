/**
 * Motor Termodinámico para cálculo de GNV
 * Utiliza el método de Papay modificado para el cálculo del Factor Z.
 */

// Constantes estándar basadas en gas natural (aprox. 90-92% metano)
const STANDARD_MOLAR_MASS = 16.5; // g/mol (peso molecular estándar GNV)
const CRITICAL_PRESSURE = 46.0; // bar (Presión seudocrítica)
const CRITICAL_TEMPERATURE = 191.0; // K (Temperatura seudocrítica)
const UNIVERSAL_GAS_CONSTANT = 0.0831446; // L*bar/(K*mol)

// Condiciones estándar (Sm3)
const STANDARD_PRESSURE = 1.01325; // 1 atm = 1.01325 bar
const STANDARD_TEMPERATURE = 288.15; // 15°C = 288.15 K

/**
 * Calcula el Factor de Compresibilidad Z (Método de Papay)
 * @param {number} pressure_bar - Presión en bar
 * @param {number} temperature_K - Temperatura en Kelvin
 * @returns {number} Factor Z
 */
export const calculateZFactor = (pressure_bar, temperature_K) => {
  if (pressure_bar <= 0) return 1.0;

  const Pr = pressure_bar / CRITICAL_PRESSURE;
  const Tr = temperature_K / CRITICAL_TEMPERATURE;

  // Fórmula de Papay
  const term1 = 3.52 * Pr / Math.exp(2.26 * Tr);
  const term2 = 0.274 * Math.pow(Pr, 2) / Math.exp(1.878 * Tr);

  return 1 - term1 + term2;
};

/**
 * Convierte de psi a bar
 * @param {number} psi - Presión en psi
 * @returns {number} Presión en bar
 */
export const psiToBar = (psi) => psi * 0.0689476;

/**
 * Convierte de bar a psi
 * @param {number} bar - Presión en bar
 * @returns {number} Presión en psi
 */
export const barToPsi = (bar) => bar / 0.0689476;

/**
 * Convierte de Celsius a Kelvin
 * @param {number} celsius - Temperatura en °C
 * @returns {number} Temperatura en Kelvin
 */
export const celsiusToKelvin = (celsius) => Number(celsius) + 273.15;

/**
 * Convierte de Kelvin a Celsius
 * @param {number} kelvin - Temperatura en K
 * @returns {number} Temperatura en Celsius
 */
export const kelvinToCelsius = (kelvin) => Number(kelvin) - 273.15;

/**
 * Calcula la masa de gas en un volumen dado bajo ciertas condiciones
 * @param {number} pressure_bar - Presión en bar
 * @param {number} temperature_K - Temperatura en Kelvin
 * @param {number} volume_L - Volumen geométrico en Litros
 * @returns {number} Masa en kilogramos (kg)
 */
export const calculateMass = (pressure_bar, temperature_K, volume_L) => {
  if (pressure_bar <= 0) return 0;
  
  const zFactor = calculateZFactor(pressure_bar, temperature_K);
  
  // m = (P * V * M) / (Z * R * T) en gramos
  const mass_g = (pressure_bar * volume_L * STANDARD_MOLAR_MASS) / (zFactor * UNIVERSAL_GAS_CONSTANT * temperature_K);
  
  // Convertir a kg
  return mass_g / 1000;
};

/**
 * Calcula el volumen estándar (Sm3) a partir de una masa dada
 * @param {number} mass_kg - Masa en kilogramos
 * @returns {number} Volumen estándar en Sm3
 */
export const calculateStandardVolume = (mass_kg) => {
  // zStd es casi 1.0, pero lo calculamos para mayor precisión
  const zStd = calculateZFactor(STANDARD_PRESSURE, STANDARD_TEMPERATURE);
  const mass_g = mass_kg * 1000;
  
  // V = (m * Z * R * T) / (P * M) en Litros
  const volume_L = (mass_g * zStd * UNIVERSAL_GAS_CONSTANT * STANDARD_TEMPERATURE) / (STANDARD_PRESSURE * STANDARD_MOLAR_MASS);
  
  // Convertir a m3
  return volume_L / 1000;
};

/**
 * Calcula la transferencia de gas (carga) entre condiciones iniciales y finales
 * @param {Object} initial - { pressure_bar, temperature_K }
 * @param {Object} final - { pressure_bar, temperature_K }
 * @param {number} moduleVolume_L - Volumen del módulo en litros
 * @returns {Object} Resultado con masa y volumen transferido
 */
export const calculateTransfer = (initial, final, moduleVolume_L) => {
  const massInitial = calculateMass(initial.pressure_bar, initial.temperature_K, moduleVolume_L);
  const massFinal = calculateMass(final.pressure_bar, final.temperature_K, moduleVolume_L);
  
  const massTransferred = Math.max(0, massFinal - massInitial);
  const volumeTransferred = calculateStandardVolume(massTransferred);

  return {
    mass_kg: massTransferred,
    volume_Sm3: volumeTransferred,
    massInitial_kg: massInitial,
    massFinal_kg: massFinal
  };
};
