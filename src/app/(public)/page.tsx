import {
  BarChart3,
  ClipboardCheck,
  FileText,
  ListChecks,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { MockBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

// Owner: ตัง — Landing page, Figma frame "01 Landing Page".
// Pricing, news and partners are placeholders until the business team sends real content.

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

const PLANS = ["Starter", "Professional", "Enterprise"];

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

      <Section id="pricing" eyebrow="Pricing" title="Plans for every stage" badge={<MockBadge label="Placeholder pricing" />}>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Card key={p} className={i === 1 ? "border-primary shadow-glow" : undefined}>
              <CardBody className="flex h-full flex-col">
                <h3 className="text-lg font-semibold">{p}</h3>
                <p className="mt-2 text-3xl font-extrabold">[Price]</p>
                <p className="text-sm text-subtle">[Billing period]</p>
                <ul className="mt-4 flex-1 list-inside list-disc space-y-1 text-sm text-muted">
                  <li>[Feature from business team]</li>
                  <li>[Feature from business team]</li>
                  <li>[Feature from business team]</li>
                </ul>
                <ButtonLink href="/register" variant={i === 1 ? "primary" : "outline"} className="mt-6">
                  Get started
                </ButtonLink>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="news" eyebrow="News" title="Cybersecurity news" badge={<MockBadge label="Placeholder" />}>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <CardBody>
                <Newspaper className="size-6 text-subtle" />
                <h3 className="mt-3 font-semibold">[News headline]</h3>
                <p className="mt-1 text-sm text-muted">[Short summary — content pending]</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="partners" eyebrow="Partners" title="Trusted partners" badge={<MockBadge label="Placeholder" />}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex h-20 items-center justify-center rounded-xl border border-dashed border-line text-sm text-subtle"
            >
              [Partner logo]
            </div>
          ))}
        </div>
      </Section>

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
