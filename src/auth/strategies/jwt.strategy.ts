import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secreto-para-desarrollo', // ⚠️ Cambia esto en producción
    });
  }

  validate(payload: JwtPayload): { userId: string; email: string } {
    // Validación mínima - puedes expandir esto luego
    if (!payload.userId || !payload.email) {
      throw new Error('Token inválido: faltan datos esenciales');
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  }
}
