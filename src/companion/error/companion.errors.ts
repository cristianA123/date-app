// import { CodeError } from './codeError.error';
import { HttpStatus } from '@nestjs/common';
import { AppError } from 'src/common/errors';
import { CodeError } from 'src/common/errors/codeError.error';
// import { AppError } from './base.error';

export class CompanionError extends AppError {
  constructor(userId: number) {
    super(
      `El usuario con ID ${userId} ya tiene un perfil de acompañante.`,
      HttpStatus.CONFLICT,
      CodeError.ACCOUNT_COMPANION_ALREADY_EXISTS,
      // { email },
    );
  }
}

export class CompanionNotExistsError extends AppError {
  constructor(userId: number) {
    super(
      `El usuario con ID ${userId} no esta registrado como acompañante.`,
      HttpStatus.CONFLICT,
      CodeError.ACCOUNT_COMPANION_NOT_FOUND,
      // { email },
    );
  }
}
