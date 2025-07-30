import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RequestWithUser } from './types/auth.types';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() authDto: AuthDto) {
    const user = await this.authService.validateUser(authDto);

    return this.authService.login(user);
  }

  @Post('/refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return await this.authService.refreshTokens(refreshDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/private')
  private(@Req() request: RequestWithUser) {
    // 1. Validar usuario
    const user = request.user;
    return { user, a: 'Aa' };
    // return { a: 'Aa' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/renew')
  async renew(@Req() request: RequestWithUser) {
    console.log("renew")
    const user = request.user;
    console.log({user})
    return this.authService.renewToken(user);
  }
}
