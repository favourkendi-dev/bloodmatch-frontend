function Footer() {
  return (
    <footer className="px-6 py-8 bg-background text-center border-t border-secondary/20">
      <p className="text-text-muted text-sm">
        &copy; {new Date().getFullYear()} BloodMatch. Connecting donors and hospitals.
      </p>
    </footer>
  )
}

export default Footer
