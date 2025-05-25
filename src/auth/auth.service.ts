/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { successResponse } from 'src/utils/response';

interface UserWithoutPassword {
  id: number;
  name: string;
  email: string;
  // otras propiedades sin password
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(authDto: AuthDto) {
    // 1. Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 2. Comparar contraseñas
    const passwordMatch = await bcrypt.compare(authDto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Eliminar contraseña del objeto usuario
    const { password, ...result } = user;
    console.log(password);
    return result;
  }

  // Alternativa: JWT refresh tokens
  generateTokens(user: UserWithoutPassword): TokenPair {
    const payload = { userId: user.id, email: user.email };

    // Access token (corta duración)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '12h',
    });

    // Refresh token como JWT (larga duración)
    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000), // timestamp para rotación
      },
      {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      },
    );

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verificar JWT refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar usuario
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const { password, ...userWithoutPassword } = user;
      const tokens = this.generateTokens(userWithoutPassword);

      return successResponse({
        user: userWithoutPassword,
        ...tokens,
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  login(user: UserWithoutPassword) {
    const payload = { userId: user.id, email: user.email };
    console.log(user);
    // const token = this.jwtService.sign(payload);
    const tokens = this.generateTokens(user);
    const { accessToken, refreshToken } = tokens;

    const data = {
      user: { ...user },
      accessToken,
      refreshToken,
    };
    return successResponse(data);
  }
}
