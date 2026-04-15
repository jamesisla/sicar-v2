import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../common/database/entities/usuario.entity';
import { Cliente } from '../common/database/entities/cliente.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(login: string, password: string) {
    const user = await this.usuarioRepo.findOne({ where: { login }, relations: ['perfil'] });

    if (!user || user.estado !== 1) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Support bcrypt and legacy plain passwords during migration
    let valid = false;
    if (user.password?.startsWith('$2b$') || user.password?.startsWith('$2a$')) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      valid = user.password === password;
    }

    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.generateTokens({
      sub: user.id,
      login: user.login,
      perfilId: user.perfilId,
      region: user.regionId,
      nombre: `${user.nombre} ${user.apellidoPaterno}`,
    });
  }

  async portalLogin(rut: number, password: string) {
    const cliente = await this.clienteRepo.findOne({ where: { rut } });
    if (!cliente) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, cliente.password || '');
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.generateTokens({
      sub: cliente.id,
      login: `${cliente.rut}-${cliente.dv}`,
      perfilId: 99,
      region: 0,
      nombre: cliente.nombre,
      isPortal: true,
    });
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET') || 'refresh-secret',
      });
      return this.generateTokens({
        sub: payload.sub, login: payload.login,
        perfilId: payload.perfilId, region: payload.region,
        nombre: payload.nombre, isPortal: payload.isPortal,
      });
    } catch {
      throw new UnauthorizedException('Sesión expirada, por favor inicie sesión nuevamente');
    }
  }

  private generateTokens(payload: object) {
    const secret = this.config.get('JWT_SECRET') || 'default-secret';
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET') || 'refresh-secret';
    return {
      accessToken: this.jwt.sign(payload, { secret, expiresIn: '8h' }),
      refreshToken: this.jwt.sign(payload, { secret: refreshSecret, expiresIn: '24h' }),
      expiresIn: 8 * 3600,
    };
  }
}
