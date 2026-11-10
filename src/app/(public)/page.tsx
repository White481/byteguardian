import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  ListChecks,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import news from "@data/content/news.json";
import pricing from "@data/content/pricing.json";
import { ContactForm } from "./contact-form";

// Owner: ตัง — Landing page, Figma frame "01 Landing Page".
// Pricing and news come from data/content/*.json (edit those, not this file).
// Partners section is hidden until the business team sends real logos.

const FEATURES = [
  { icon: ClipboardCheck, title: "Guided assessment", text: "Answer structured questions mapped to NIST CSF 2.0, with evidence uploads and autosave." },
  { icon: BarChart3, title: "Maturity dashboard", text: "See current vs target tiers, gaps by function and category, and a risk heatmap." },
  { icon: Sparkles, title: "AI insights", text: "Get findings and prioritized recommendations generated from your answers." },
  { icon: ListChecks, title: "Action plan", text: "Turn recommendations into a roadmap with owners, phases and progress tracking." },
  { icon: FileText, title: "Executive reports", text: "Share a complete report with leadership — save it as PDF in one click." },
  { icon: Users, title: "Team collaboration", text: "Invite colleagues as admins, members or read-only viewers." },
];

const STEPS = [
  { title: "Set up your company", text: "Tell us about your industry, size and technology." },
  { title: "Run the assessment", text: "Pick Full, Quick or Custom and answer at your own pace." },
  { title: "Review results", text: "Understand your maturity tier, gaps and top risks." },
  { title: "Act on the plan", text: "Follow AI recommendations and track progress over time." },
];

const SOLUTIONS = [
  { title: "Small & medium businesses", text: "A clear starting point for security without a large team." },
  { title: "Enterprises", text: "Benchmark business units and track improvement across assessments." },
  { title: "Regulated industries", text: "Prepare for audits with documented evidence and reports." },
];

// Newest first
const NEWS = [...news].sort((a, b) => b.date.localeCompare(a.date));

export default function LandingPage() {
  return (
    <>
      <section id="top" className="bg-cyber-grid border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <span className="inline-block rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm text-fg-soft">
            AI-Powered Cybersecurity Maturity Assessment
          </span>
          <h1 className="mt-5 max-w-2xl text-5xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl">
            Know Your Security Posture. <span className="text-accent">Build a Stronger Tomorrow.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            ByteGuardian helps organizations evaluate cybersecurity maturity, identify security gaps, visualize
            results and receive AI-generated recommendations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Start Assessment →
            </ButtonLink>
            <ButtonLink href="#how" size="lg" variant="outline">
              Learn More
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section id="features" eyebrow="Platform" title="Everything you need to measure and improve security">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <CardBody>
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-accent">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="how" eyebrow="How it works" title="From first question to action plan in four steps">
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-surface/80 p-5">
              <span className="text-gradient text-3xl font-extrabold">0{i + 1}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="solutions" eyebrow="Solutions" title="Built for organizations of every size">
        <div className="grid gap-4 md:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <Card key={s.title}>
              <CardBody>
                <ShieldCheck className="size-6 text-accent" />
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Pricing" title="Free to start, software-priced after">
        <p className="-mt-6 mb-8 max-w-3xl text-muted">All prices in Thai baht. {pricing.contractNote}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pricing.plans.map((p) => (
            <Card key={p.id} className={p.highlight ? "border-primary shadow-glow" : undefined}>
              <CardBody className="flex h-full flex-col">
                {p.highlight && (
                  <Badge tone="primary" className="w-fit">
                    Most popular
                  </Badge>
                )}
                <h3 className="mt-3 text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-accent">{p.audience}</p>

                <div className="mt-4">
                  <p className="text-2xl font-extrabold">
                    {p.price === "Quoted" ? p.price : `฿${p.price}`}
                    {p.period && <span className="text-sm font-medium text-subtle"> {p.period}</span>}
                  </p>
                  <p className="text-xs text-subtle">{p.priceNote}</p>
                </div>

                <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-fg-soft">
                  {p.features.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>

                <ButtonLink
                  href={p.cta === "contact" ? "#contact" : "/register"}
                  variant={p.highlight ? "primary" : "outline"}
                  className="mt-6"
                >
                  {p.cta === "contact" ? "Contact us" : p.price === "0" ? "Start free" : "Get started"}
                </ButtonLink>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pricing.valuePoints.map((v) => (
            <div key={v.title} className="rounded-2xl border border-line p-5">
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="news" eyebrow="News" title="Cybersecurity news & updates">
        <div className="grid gap-4 md:grid-cols-3">
          {NEWS.map((n) => (
            <Card key={n.url}>
              <CardBody className="flex h-full flex-col">
                <div className="flex items-center gap-2 text-xs text-subtle">
                  <Newspaper className="size-4" />
                  {n.source} · <time dateTime={n.date}>{formatDate(n.date)}</time>
                </div>
                <h3 className="mt-3 font-semibold">{n.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{n.summary}</p>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  Read at {n.source} <ExternalLink className="size-3.5" />
                </a>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* Partners section removed until we have real partner logos (placeholders looked unfinished in demos). */}

      <Section id="contact" eyebrow="Contact" title="Talk to us">
        <div className="grid gap-8 md:grid-cols-2">
          <p className="text-muted">
            Questions about ByteGuardian, pricing or a demo for your team? Send us a message and we&apos;ll get back to
            you.
          </p>
          <Card>
            <CardBody>
              <ContactForm />
            </CardBody>
          </Card>
        </div>
      </Section>
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  badge,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>
        <div className="mt-2 mb-10 flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {badge}
        </div>
        {children}
      </div>
    </section>
  );
}
