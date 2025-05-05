import { CodeError } from './codeError.error';
import { HttpStatus } from '@nestjs/common';
import { AppError } from './base.error';

export class CompanionAlreadyExistsError extends AppError {
  constructor(userId: number) {
    super(
      `El usuario con ID ${userId} ya existe`,
      HttpStatus.CONFLICT,
      CodeError.ACCOUNT_COMPANION_ALREADY_EXISTS,
      // { email },
    );
  }
}
