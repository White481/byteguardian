import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7 text-sm text-muted">
        <strong className="text-fg">ByteGuardian</strong>
        <span>Secure Today. Stronger Tomorrow.</span>
        <span className="flex gap-4">
          <Link href="/privacy" className="hover:text-fg">
            Privacy
          </Link>
          <span>© {new Date().getFullYear()} ByteGuardian</span>
        </span>
      </div>
    </footer>
  );
}
