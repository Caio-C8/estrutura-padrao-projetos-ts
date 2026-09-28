import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { DATABASE_CLIENT } from "../src/common/database/database.constants";
import { RespostaErroSchema } from "@repo/contracts";
import * as z from "zod";

describe("health endpoint", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const databaseClientMock = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DATABASE_CLIENT)
      .useValue(databaseClientMock)
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("returns the service status", async () => {
    const response = await request(app.getHttpServer()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
    });
    expect(["development", "staging", "production", "test"]).toContain(
      response.body.environment,
    );
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it("returns the public error contract for an unknown route", async () => {
    const response = await request(app.getHttpServer()).get(
      "/api/rota-inexistente",
    );

    expect(response.status).toBe(404);

    const resultado = RespostaErroSchema.safeParse(response.body);

    expect(resultado.success).toBe(true);

    if (!resultado.success) {
      throw new Error("A resposta não atende ao contrato público de erro.");
    }

    expect(resultado.data).toMatchObject({
      status: 404,
      sucesso: false,
      codigo: "RECURSO_NAO_ENCONTRADO",
      mensagem: "O recurso solicitado não foi encontrado.",
      erros: [],
    });

    expect(z.uuid().safeParse(resultado.data.requisicaoId).success).toBe(true);
  });
});
