import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { SnakeCaseInterceptor } from './shared/interceptors/snake-case.interceptor';

export const GLOBAL_PREFIX = 'api';

/** Applies the HTTP pipeline shared by the server and the e2e tests. */
export function configureApp(app: INestApplication): void {
  app.enableCors();
  app.use(helmet());
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new SnakeCaseInterceptor());
}
