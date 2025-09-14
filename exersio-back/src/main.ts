import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  const corsOrigins = process.env.CORS_ORIGIN
    ? [process.env.CORS_ORIGIN, 'http://localhost:5173', 'http://192.168.0.110:5173']
    : [
        'http://localhost:5173',
        'http://192.168.0.110:5173',
        'http://10.0.2.2:5173',
        'capacitor://localhost',
        'http://localhost',
        'https://localhost'
      ];

  console.log('🔧 CORS Origins configured:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new WrapResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Exersio API')
    .setDescription('API documentation for Exersio (NestJS)')
    .setVersion('0.3.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app
    .getHttpAdapter()
    .getInstance()
    .get('/health', (_req: any, res: any) => res.json({ status: 'ok' }));

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`Exersio API (Nest) running on http://0.0.0.0:${port} (accessible via http://192.168.0.110:${port})`);
}
bootstrap();
