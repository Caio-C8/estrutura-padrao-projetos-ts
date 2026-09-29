import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import type { EnvironmentVariables } from "./environment";
import { CABECALHO_REQUISICAO_ID } from "./common/middleware/requisicao-id.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<EnvironmentVariables, true>);

  const port = config.getOrThrow("API_PORT", { infer: true });

  const origins = config
    .getOrThrow("CORS_ORIGINS", { infer: true })
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: origins,
    credentials: true,
    exposedHeaders: [CABECALHO_REQUISICAO_ID],
  });

  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");

  console.info(`API ready at http://localhost:${port}/api`);
}

void bootstrap();
