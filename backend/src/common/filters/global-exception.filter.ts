import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const correlationId = uuidv4();

    const httpException = exception instanceof HttpException ? exception : null;

    const status = httpException
      ? httpException.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = httpException
      ? ((httpException.getResponse() as any)?.message || httpException.message)
      : 'Error interno del servidor';

    this.logger.error({
      correlationId,
      timestamp: new Date().toISOString(),
      endpoint: request.url,
      method: request.method,
      statusCode: status,
      message: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
