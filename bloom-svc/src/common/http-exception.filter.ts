import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * 모든 오류 응답을 프론트엔드가 기대하는 `{ error: string }` 형태로 정규화합니다.
 * ValidationPipe 의 message 배열은 첫 메시지만 사용합니다.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json({
        error: this.messageOf(exception.getResponse(), exception.message),
      });
      return;
    }

    this.logger.error(exception);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: '서버 오류가 발생했어요.' });
  }

  private messageOf(body: unknown, fallback: string): string {
    if (typeof body === 'string') return body;
    if (body && typeof body === 'object') {
      const { error, message } = body as { error?: unknown; message?: unknown };
      if (typeof error === 'string') return error;
      if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
      if (typeof message === 'string') return message;
    }
    return fallback;
  }
}