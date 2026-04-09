import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export function calcularDV(rut: number): string {
  let suma = 0;
  let multiplo = 2;
  const rutStr = rut.toString();
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

@ValidatorConstraint({ name: 'isValidRut', async: false })
export class IsValidRutConstraint implements ValidatorConstraintInterface {
  validate(dv: string, args: any) {
    const rut = args.object?.rut || args.object?.clrut;
    if (!rut) return false;
    return validarRut(Number(rut), dv);
  }
  defaultMessage() { return 'El dígito verificador del RUT es incorrecto'; }
}

export function IsValidRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRutConstraint,
    });
  };
}
