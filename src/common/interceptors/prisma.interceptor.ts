/* eslint-disable no-case-declarations */
// src/common/interceptors/prisma.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (this.isPrismaError(error)) {
          return throwError(() => this.handlePrismaError(error));
        }
        return throwError(() => error);
      }),
    );
  }

  private isPrismaError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): Error {
    const errorCode = error.code;
    const meta = error.meta as { target?: string[] } | undefined;

    switch (errorCode) {
      case 'P2002':
        const target = meta?.target?.[0] ?? 'registro';
        return new ConflictException(
          `Ya existe un registro con estos datos. ${target}`,
        );

      case 'P2025':
        return new NotFoundException('Registro no encontrado');

      default:
        return new BadRequestException(
          'Error en la operación de base de datos',
        );
    }
  }
}

// // Tipos auxiliares para mayor seguridad
// type PrismaErrorCode =
//   | 'P2002' // Unique constraint
//   | 'P2025' // Record not found
//   | string; // Otros códigos
