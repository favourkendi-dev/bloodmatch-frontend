function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 py-20 bg-background">
      <h1 className="text-4xl font-bold text-primary mb-4">
        BloodMatch
      </h1>
      <p className="text-lg text-text-muted max-w-xl mb-8">
        Connecting blood donors with hospitals in need, faster.
      </p>
      <div className="flex gap-4">
        <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition">
          Get Started
        </button>
        <button className="bg-white text-primary border border-primary font-semibold px-6 py-3 rounded-full transition">
          Learn More
        </button>
      </div>
    </section>
  )
}

export default Hero
