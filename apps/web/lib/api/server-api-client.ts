import "server-only";
import { createApiClient } from "./core/create-api-client";

const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export const serverApiClient = createApiClient({
  baseUrl: `${apiInternalUrl}/api`,
});
