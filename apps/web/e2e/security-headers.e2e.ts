import { createListProdutosResponse } from "./fixtures/produtos";
import { expect, test } from "./support/test";

declare global {
  interface Window {
    __cspViolations?: string[];
  }
}

const caminhos = ["/", "/api/health"] as const;

for (const caminho of caminhos) {
  test(`envia headers de segurança em ${caminho}`, async ({ request }) => {
    const response = await request.get(caminho);

    expect(response.ok()).toBe(true);

    const headers = response.headers();
    const contentSecurityPolicy = headers["content-security-policy"];

    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).not.toContain("'unsafe-eval'");

    expect(headers["permissions-policy"]).toBe(
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    );
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
}

test("carrega schemas no navegador sem violar a CSP", async ({
  page,
  apiMock,
}) => {
  await page.addInitScript(() => {
    window.__cspViolations = [];

    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations?.push(
        `${event.violatedDirective}: ${event.blockedURI}`,
      );
    });
  });

  apiMock.expectGet("/produtos", ({ url }) => {
    expect(Object.fromEntries(url.searchParams)).toEqual({
      limite: "20",
      pagina: "1",
    });

    return {
      body: createListProdutosResponse(),
    };
  });

  await page.goto("/produtos");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Produtos",
    }),
  ).toBeVisible();

  const cspViolations = await page.evaluate(() => window.__cspViolations ?? []);

  expect(cspViolations).toEqual([]);
});
