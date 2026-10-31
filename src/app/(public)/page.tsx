import { ButtonLink } from "@/components/ui/button";
import { PagePlaceholder } from "@/components/ui/page";

// Owner: ตัง — Landing page. Hero is done as a starting point; build the other sections
// from the Figma frame "01 Landing Page".
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

      <div className="mx-auto max-w-6xl px-6 py-16">
        <PagePlaceholder
          owner="ตัง"
          reference='Figma frame "01 Landing Page"'
          todo={[
            "Introduction + Platform Features (#features)",
            "How It Works (#how)",
            "Solutions (#solutions)",
            "Pricing Packages (#pricing) — prices are placeholders until the business team sends them",
            "Cybersecurity News (#news) and Partners (#partners) — placeholders, no real logos",
            "Contact Us form (#contact)",
          ]}
        />
      </div>
    </>
  );
}
