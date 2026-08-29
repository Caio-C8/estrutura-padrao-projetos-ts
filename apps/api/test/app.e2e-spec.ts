import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { DATABASE_CLIENT } from "../src/common/database/database.constants";

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
});
