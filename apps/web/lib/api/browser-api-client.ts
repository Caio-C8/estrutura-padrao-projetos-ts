import "client-only";
import { createApiClient } from "./core/create-api-client";

export const browserApiClient = createApiClient({
  baseUrl: "/api/backend",
});
