import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const port = process.env.PORT ?? '3000';
  const ADMIN_PORTAIL_URL = process.env.ADMIN_PORTAIL_URL ?? '';
  const GUEST_PORTAIL_URL = process.env.GUEST_PORTAIL_URL ?? '';
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Supprime les propriétés inconnues
      forbidNonWhitelisted: true, // Rejette les propriétés inconnues
      whitelist: true, // Transforme les données en types DTO
    }),
  );

  // Ajouter cette ligne pour préfixer toutes les routes avec /api
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      `http://${ADMIN_PORTAIL_URL}`,
      `http://www.${ADMIN_PORTAIL_URL}`,
      `https://${ADMIN_PORTAIL_URL}`,
      `https://www.${ADMIN_PORTAIL_URL}`,
      `http://${GUEST_PORTAIL_URL}`,
      `http://www.${GUEST_PORTAIL_URL}`,
      `https://${GUEST_PORTAIL_URL}`,
      `https://www.${GUEST_PORTAIL_URL}`,
    ],
    credentials: true,
  });

  // config swagger
  const config = new DocumentBuilder()
    .setTitle('Crew Investment API Documentation')
    .setDescription("informations sur les endpoints metiers de l'api.")
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Version 1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
