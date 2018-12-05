import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { SnakeCaseInterceptor } from './shared/interceptors/snake-case.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main', true);
  const globalPrefix = '/api';

  app.enableCors();
  app.use(helmet());

  // Build the swagger doc only in dev mode
  if (AppModule.isDev) {
    const swaggerOptions = new DocumentBuilder()
      .setTitle('Macaron API')
      .setDescription('API documentation for Macaron Engine')
      // .setVersion(version)
      .setBasePath(globalPrefix)
      .addBearerAuth('Authorization', 'header')
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);

    SwaggerModule.setup(`${globalPrefix}/swagger`, app, swaggerDoc);
  }

  app.setGlobalPrefix(globalPrefix);

  // Validate query params and body
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Convert exceptions to JSON readable format
  app.useGlobalFilters(new HttpExceptionFilter());

  // Convert all JSON object keys to snake_case
  app.useGlobalInterceptors(new SnakeCaseInterceptor());

  await app.listen(AppModule.port);

  // Log current url of app
  let baseUrl = app.getHttpServer().address().address;
  if (baseUrl === '0.0.0.0' || baseUrl === '::') {
    baseUrl = 'localhost';
  }
  logger.log(`Listening to http://${baseUrl}:${AppModule.port}${globalPrefix}`);
  if (AppModule.isDev) {
    logger.log(
      `Swagger UI: http://${baseUrl}:${AppModule.port}${globalPrefix}/swagger`,
    );
  }
}
bootstrap();
