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
// News is curated by hand with links to its sources. Partners are placeholders until the business team sends real content.

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

const PLANS = [
  {
    name: "Essential Prism",
    level: "Light requirements",
    monthly: "฿25,000",
    annual: "฿300,000/year",
    setup: "฿50,000",
    features: ["General risk assessment", "System setup and onboarding in 1-2 weeks"],
    cta: { label: "Get started", href: "/register" },
  },
  {
    name: "Business Prism",
    level: "Standard requirements",
    monthly: "฿60,000",
    annual: "฿720,000/year",
    setup: "฿150,000",
    features: ["Security policy development", "Staff training", "Delivered in 3-4 weeks"],
    cta: { label: "Get started", href: "/register" },
    featured: true,
  },
  {
    name: "Enterprise Prism",
    level: "High, complex requirements",
    monthly: "฿120,000",
    annual: "฿1,440,000/year",
    setup: "฿350,000",
    features: ["New infrastructure setup", "Threat response drills", "Delivered in 1-2 months"],
    cta: { label: "Get started", href: "/register" },
  },
  {
    name: "Ultimate / Tailored Prism",
    level: "Complex, custom requirements",
    monthly: "฿250,000-450,000",
    annual: "From ฿3,000,000/year",
    setup: "From ฿800,000, or by on-site evaluation",
    features: ["In-depth system audit", "Implementation to ISO/NIST standards", "Ongoing delivery over 3+ months"],
    cta: { label: "Contact us", href: "#contact" },
  },
];

const NEWS = [
  {
    date: "October 5, 2026",
    title: "Citrix NetScaler flaw under active exploitation",
    text: "CVE-2026-88779 (CVSS 8.7) affects customer-managed NetScaler ADC and Gateway deployments configured for SAML. Sophos advises applying the latest Citrix updates as soon as possible.",
    source: "Sophos",
    href: "https://www.sophos.com/en-us/blog/citrix-netscaler-vulnerability-cve-2026-88779-in-active-exploitation",
  },
  {
    date: "March 23, 2026",
    title: "NIST releases two new CSF 2.0 quick-start guides",
    text: "A final guide covers cybersecurity, enterprise risk and workforce management, alongside a public draft on informative references.",
    source: "NIST",
    href: "https://content.govdelivery.com/accounts/USNIST/bulletins/40ebddc",
  },
  {
    date: "August 22, 2024",
    title: "Thailand's first administrative fine under the PDPA",
    text: "A major private company was fined THB 7 million over a missing data protection officer, inadequate security and delayed breach notification.",
    source: "Tilleke & Gibbins",
    href: "https://www.tilleke.com/insights/landmark-fine-imposed-under-thailands-personal-data-protection-act/3/",
  },
];

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

      <Section id="pricing" eyebrow="Pricing" title="Plans for every stage">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <Card key={p.name} className={p.featured ? "border-primary shadow-glow" : undefined}>
              <CardBody className="flex h-full flex-col">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-subtle">{p.level}</p>
                <p className="mt-3 text-2xl font-extrabold">{p.monthly}</p>
                <p className="text-sm text-subtle">per month ({p.annual})</p>
                <p className="mt-2 text-sm text-muted">One-time setup fee: {p.setup}</p>
                <ul className="mt-4 flex-1 list-inside list-disc space-y-1 text-sm text-muted">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <ButtonLink href={p.cta.href} variant={p.featured ? "primary" : "outline"} className="mt-6">
                  {p.cta.label}
                </ButtonLink>
              </CardBody>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-subtle">Monthly fees require a minimum 1-year contract.</p>
      </Section>

      <Section id="news" eyebrow="News" title="Cybersecurity news">
        <div className="grid gap-4 md:grid-cols-3">
          {NEWS.map((n) => (
            <Card key={n.href}>
              <CardBody className="flex h-full flex-col">
                <Newspaper className="size-6 text-subtle" />
                <p className="mt-3 text-sm text-subtle">{n.date}</p>
                <h3 className="mt-1 font-semibold">{n.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{n.text}</p>
                <a href={n.href} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-medium text-primary hover:underline">
                  Read more at {n.source}
                </a>
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
