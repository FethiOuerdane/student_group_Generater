export function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-ping"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-accent/40 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-secondary/20 rounded-full animate-bounce delay-500"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary/50 rounded-full animate-ping delay-700"></div>
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-accent/30 rounded-full animate-pulse delay-300"></div>
    </div>
  )
}
