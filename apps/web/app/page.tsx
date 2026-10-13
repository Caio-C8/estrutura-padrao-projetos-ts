import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";
import { publicAppConfig } from "@/lib/config/public-app-config";

const { appName, environment } = publicAppConfig;

export const metadata: Metadata = {
  title: `Início | ${appName}`,
  description:
    "Página inicial da estrutura padrão e acesso ao catálogo de produtos.",
};

const checks = [
  {
    label: "Aplicação web",
    description: "Health check servido pelo Next.js.",
    href: "/api/health",
  },
  {
    label: "API backend",
    description: "Proxy padronizado para o NestJS.",
    href: "/api/backend/health",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{environment}</p>

          <h1 className={styles.title}>{appName}</h1>

          <p className={styles.lead}>
            A infraestrutura está pronta. Explore o domínio de produtos e
            acompanhe a integração entre a aplicação Web, os contratos
            compartilhados e a API.
          </p>

          <div className={styles.actions}>
            <Button asChild size="lg" className={styles.primaryAction}>
              <Link href="/produtos">
                Ver produtos
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          className={styles.checksSection}
          aria-labelledby="checks-title"
        >
          <h2 id="checks-title" className={styles.sectionTitle}>
            Verificações da base
          </h2>

          <div className={styles.checksGrid}>
            {checks.map((check) => (
              <a
                className={styles.checkCard}
                href={check.href}
                key={check.href}
              >
                <span className={styles.checkLabel}>{check.label}</span>

                <p className={styles.checkDescription}>{check.description}</p>

                <code className={styles.checkPath}>{check.href}</code>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
