import Link from "next/link";

export function PlaceholderPage({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">MVP Skeleton</p>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{description}</p>
      {href && action ? <Link href={href} className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">{action}</Link> : null}
    </section>
  );
}
