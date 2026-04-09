import { Injectable, ConflictException } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';
import { validarRut } from '../common/validators/rut.validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private oracle: OracleService) {}

  // Usuarios
  async getUsuarios() {
    return this.oracle.executeQuery(
      `SELECT U.IDUSUARIO, U.USLOGIN, U.USNOMBRE, U.USAPELLIDOPATERNO,
              U.USRUTUSUARIO, U.USDVUSUARIO, U.USREGIONUSUARIO, U.USESTADOUSUARIO,
              U.USCORREO, P.PENOMBRE AS PERFIL
       FROM USUARIO U JOIN PERFIL P ON P.IDPERFIL = U.PERFIL_IDPERFIL
       ORDER BY U.USNOMBRE`,
      {},
    );
  }

  async createUsuario(dto: any) {
    if (!validarRut(dto.rut, dto.dv)) {
      throw new Error('El dígito verificador del RUT es incorrecto');
    }
    const existing = await this.oracle.executeQuery(
      'SELECT IDUSUARIO FROM USUARIO WHERE USLOGIN = :login', { login: dto.login },
    );
    if ((existing.rows as any[]).length > 0) {
      throw new ConflictException('El login ingresado ya está en uso');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.oracle.executeQuery(
      `INSERT INTO USUARIO (PERFIL_IDPERFIL, USNOMBRE, USAPELLIDOPATERNO, USAPELLIDOMATERNO,
        USRUTUSUARIO, USDVUSUARIO, USREGIONUSUARIO, USESTADOUSUARIO, USLOGIN, USPASSW, USCORREO, USFECHAACTUALIZA)
       VALUES (:perfilId, :nombre, :apellidoPaterno, :apellidoMaterno, :rut, :dv,
               :region, 1, :login, :password, :correo, SYSDATE)`,
      {
        perfilId: dto.perfilId, nombre: dto.nombre, apellidoPaterno: dto.apellidoPaterno,
        apellidoMaterno: dto.apellidoMaterno || null, rut: dto.rut, dv: dto.dv,
        region: dto.region, login: dto.login, password: hashedPassword,
        correo: dto.correo || null,
      },
    );
  }

  async desactivarUsuario(id: number) {
    await this.oracle.executeQuery(
      'UPDATE USUARIO SET USESTADOUSUARIO = 0, USFECHAACTUALIZA = SYSDATE WHERE IDUSUARIO = :id',
      { id },
    );
    // Revoke token by clearing it
    await this.oracle.executeQuery(
      'UPDATE USUARIO SET TOKEN = NULL WHERE IDUSUARIO = :id', { id },
    );
    return { success: true };
  }

  // Perfiles y permisos
  getPerfiles() { return this.oracle.executeQuery('SELECT * FROM PERFIL ORDER BY IDPERFIL', {}); }
  getOpciones() { return this.oracle.executeQuery('SELECT * FROM OPCIONES ORDER BY IDOPCIONES', {}); }
  getPermisos(perfilId: number) {
    return this.oracle.executeQuery(
      'SELECT * FROM PERMISO WHERE PERFIL_IDPERFIL = :perfilId', { perfilId },
    );
  }

  // SIGFE tables
  getUnidadesSigfe() { return this.oracle.executeQuery('SELECT * FROM UNIDADSIGFE ORDER BY AGNO DESC, COD_UNIDADSIGFE', {}); }
  getCuentasSigfe() { return this.oracle.executeQuery('SELECT * FROM CUENTASIGFE ORDER BY IDCUENTASIGFE', {}); }

  // SEREMI
  getSeremi() { return this.oracle.executeQuery('SELECT * FROM SEREMI ORDER BY IDREGION', {}); }
}
