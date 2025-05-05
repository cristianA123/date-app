import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async findOne(@Body() authDto: AuthDto) {
    const user = await this.authService.validateUser(authDto);

    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/private')
  private() {
    // 1. Validar usuario
    return { a: 'Aa' };
  }
}
