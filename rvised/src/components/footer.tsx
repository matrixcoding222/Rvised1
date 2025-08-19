import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <a href="mailto:support@rvised.app" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          <div>© 2025 Rvised</div>
        </div>
      </div>
    </footer>
  )
}
