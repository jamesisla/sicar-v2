export function calcularDV(rut: number): string {
  let suma = 0;
  let multiplo = 2;
  let rutStr = rut.toString();
  for (let i = rutStr.length - 1; i >= 0; i--) {
    suma += parseInt(rutStr[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return resto.toString();
}

export function validarRut(rut: number, dv: string): boolean {
  if (!rut || rut < 1000000) return false;
  return calcularDV(rut).toUpperCase() === dv.toUpperCase();
}

export function formatearRut(rut: number, dv: string): string {
  return `${rut.toLocaleString('es-CL')}-${dv}`;
}
