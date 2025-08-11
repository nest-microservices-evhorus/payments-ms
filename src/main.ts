import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments-ms', { timestamp: true });
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: { servers: envs.natsServers },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  await app.listen(envs.port);

  logger.log(`PAyments Microservice running on port ${envs.port}`);
}
void bootstrap();
