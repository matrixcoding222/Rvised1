export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
            <a href="https://twitter.com/rvised" className="hover:text-foreground transition-colors">
              Twitter
            </a>
          </div>

          <div>© 2024 Rvised</div>
        </div>
      </div>
    </footer>
  )
}
