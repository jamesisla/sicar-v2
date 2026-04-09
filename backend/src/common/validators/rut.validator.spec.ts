import * as fc from 'fast-check';
import { calcularDV, validarRut } from './rut.validator';

describe('RUT Validator', () => {
  // Casos concretos
  it('acepta RUT 12345678-5 (DV correcto)', () => {
    expect(validarRut(12345678, '5')).toBe(true);
  });

  it('acepta RUT con DV K', () => {
    // RUT 7775735 tiene DV K
    expect(validarRut(7775735, 'K')).toBe(true);
    expect(validarRut(7775735, 'k')).toBe(true); // case insensitive
  });

  it('rechaza RUT con DV incorrecto', () => {
    expect(validarRut(12345678, '0')).toBe(false);
  });

  it('rechaza RUT menor a 1.000.000', () => {
    expect(validarRut(999999, '0')).toBe(false);
  });

  it('rechaza RUT cero o nulo', () => {
    expect(validarRut(0, '0')).toBe(false);
  });

  // Feature: cobranza-modernization, Property 1: Validación de RUT chileno (módulo 11)
  // Validates: Requirements 2.2, 18.3, 26.6
  it('[PBT] acepta RUT con DV correcto y rechaza DV incorrecto para cualquier RUT válido', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000, max: 99999999 }),
        (rut) => {
          const dvCorrecto = calcularDV(rut);
          // DV correcto siempre debe ser aceptado
          expect(validarRut(rut, dvCorrecto)).toBe(true);

          // DV incorrecto: elegir un dígito distinto al correcto
          const dvIncorrecto = dvCorrecto === '0' ? '1' : '0';
          expect(validarRut(rut, dvIncorrecto)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('[PBT] calcularDV siempre retorna un valor en {0-9, K} para cualquier RUT válido', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000, max: 99999999 }),
        (rut) => {
          const dv = calcularDV(rut);
          expect(['0','1','2','3','4','5','6','7','8','9','K']).toContain(dv);
        },
      ),
      { numRuns: 100 },
    );
  });
});
