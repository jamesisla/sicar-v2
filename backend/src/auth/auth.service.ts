import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OracleService } from '../common/oracle/oracle.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private oracle: OracleService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(login: string, password: string) {
    const result = await this.oracle.executeQuery(
      `SELECT IDUSUARIO, USLOGIN, USPASSW, USNOMBRE, USAPELLIDOPATERNO,
              PERFIL_IDPERFIL, USREGIONUSUARIO, USESTADOUSUARIO
       FROM USUARIO WHERE USLOGIN = :login`,
      { login },
    );

    const user = result.rows[0] as any;
    if (!user || user.USESTADOUSUARIO !== 1) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Support both plain (legacy) and bcrypt passwords during migration
    let valid = false;
    if (user.USPASSW?.startsWith('$2b$') || user.USPASSW?.startsWith('$2a$')) {
      valid = await bcrypt.compare(password, user.USPASSW);
    } else {
      // Legacy: plain text or MD5 — compare directly during migration period
      valid = user.USPASSW === password;
    }

    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.generateTokens({
      sub: user.IDUSUARIO,
      login: user.USLOGIN,
      perfilId: user.PERFIL_IDPERFIL,
      region: user.USREGIONUSUARIO,
      nombre: `${user.USNOMBRE} ${user.USAPELLIDOPATERNO}`,
    });
  }

  async portalLogin(rut: number, password: string) {
    const result = await this.oracle.executeQuery(
      `SELECT IDCLIENTE, CLRUT, CLDV, CLNOMBRE, CLPASSWORD
       FROM CLIENTE WHERE CLRUT = :rut`,
      { rut },
    );

    const cliente = result.rows[0] as any;
    if (!cliente) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, cliente.CLPASSWORD || '');
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.generateTokens({
      sub: cliente.IDCLIENTE,
      login: `${cliente.CLRUT}-${cliente.CLDV}`,
      perfilId: 99, // portal client profile
      region: 0,
      nombre: cliente.CLNOMBRE,
      isPortal: true,
    });
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET') || 'refresh-secret-change-in-production',
      });
      return this.generateTokens({
        sub: payload.sub,
        login: payload.login,
        perfilId: payload.perfilId,
        region: payload.region,
        nombre: payload.nombre,
        isPortal: payload.isPortal,
      });
    } catch {
      throw new UnauthorizedException('Sesión expirada, por favor inicie sesión nuevamente');
    }
  }

  private generateTokens(payload: object) {
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET') || 'default-secret-change-in-production',
      expiresIn: '8h',
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET') || 'refresh-secret-change-in-production',
      expiresIn: '24h',
    });
    return { accessToken, refreshToken, expiresIn: 8 * 3600 };
  }
}
