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

  login(user: UserWithoutPassword) {
    const payload = { userId: user.id, email: user.email };
    console.log(user);
    const token = this.jwtService.sign(payload);
    const data = {
      name: user.name,
      email: user.email,
      token,
    };
    return successResponse(data);
  }
}
