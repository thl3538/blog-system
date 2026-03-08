import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestWithId } from '../middleware/request-id.middleware';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<RequestWithId>();

    const method = req.method;
    const path = req.originalUrl ?? req.url;
    const requestId = req.requestId ?? 'n/a';

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(`${method} ${path} ${duration}ms rid=${requestId}`);
      }),
    );
  }
}
