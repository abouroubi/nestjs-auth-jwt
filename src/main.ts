import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp, GLOBAL_PREFIX } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main', { timestamp: true });

  // Must run before the Swagger document is built so documented paths
  // include the global prefix.
  configureApp(app);

  if (AppModule.isDev) {
    const swaggerOptions = new DocumentBuilder()
      .setTitle('Macaron API')
      .setDescription('API documentation for Macaron Engine')
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);

    SwaggerModule.setup(`${GLOBAL_PREFIX}/swagger`, app, swaggerDoc);
  }

  await app.listen(AppModule.port);

  let baseUrl = app.getHttpServer().address().address;
  if (baseUrl === '0.0.0.0' || baseUrl === '::') {
    baseUrl = 'localhost';
  }
  logger.log(
    `Listening to http://${baseUrl}:${AppModule.port}/${GLOBAL_PREFIX}`,
  );
  if (AppModule.isDev) {
    logger.log(
      `Swagger UI: http://${baseUrl}:${AppModule.port}/${GLOBAL_PREFIX}/swagger`,
    );
  }
}
void bootstrap();
