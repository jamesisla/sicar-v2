import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'default-secret-change-in-production',
    });
  }

  async validate(payload: any) {
    return {
      idUsuario: payload.sub,
      login: payload.login,
      perfilId: payload.perfilId,
      region: payload.region,
      nombre: payload.nombre,
    };
  }
}
