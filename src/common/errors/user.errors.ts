import { CodeError } from './codeError.error';
import { HttpStatus } from '@nestjs/common';
import { AppError } from './base.error';

export class UserNotFoundError extends AppError {
  constructor(emailOrId: string) {
    super(
      `Usuario no encontrado: ${emailOrId}`,
      HttpStatus.NOT_FOUND,
      CodeError.USER_NOT_FOUND,
      // { identifier: emailOrId },
    );
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(
      `El usuario con email ${email} ya existe`,
      HttpStatus.CONFLICT,
      CodeError.USER_ALREADY_EXISTS,
      // { email },
    );
  }
}
