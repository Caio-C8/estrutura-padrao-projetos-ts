const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Project Starter";
const environment = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

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
    <main>
      <section className="hero">
        <p className="eyebrow">{environment}</p>
        <h1>{appName}</h1>
        <p className="lead">
          A infraestrutura está pronta. Substitua esta página pelo domínio do
          novo produto e mantenha os contratos compartilhados em packages.
        </p>
      </section>

      <section className="grid" aria-label="Verificações da base">
        {checks.map((check) => (
          <a className="card" href={check.href} key={check.href}>
            <span>{check.label}</span>
            <p>{check.description}</p>
            <code>{check.href}</code>
          </a>
        ))}
      </section>
    </main>
  );
}
