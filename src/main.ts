import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // eslint-disable-next-line prettier/prettier
    origin: "https://www.yougolfbhutan.com",   // your Next.js app
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
