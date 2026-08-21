import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Set global prefix for API endpoints
  app.setGlobalPrefix('api');

  // Serve static frontend from public directory
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application running at http://localhost:${port}`);
  console.log(`📡 API endpoints mounted at http://localhost:${port}/api`);
}
bootstrap();

