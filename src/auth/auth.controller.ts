import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RequestWithUser } from './types/auth.types';

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
  private(@Req() request: RequestWithUser) {
    // 1. Validar usuario
    const user = request.user;
    return { user, a: 'Aa' };
    // return { a: 'Aa' };
  }
}
