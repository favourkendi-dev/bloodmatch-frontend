function HowItWorks() {
  const steps = [
    {
      title: 'Register',
      description: 'Sign up as a donor or a hospital in just a few steps.',
    },
    {
      title: 'Get Matched',
      description: 'Hospitals post requests, and nearby compatible donors are found automatically.',
    },
    {
      title: 'Save a Life',
      description: 'Donors confirm, donate, and hospitals mark the request fulfilled.',
    },
  ]

  return (
    <section className="px-6 py-16 bg-white">
      <h2 className="text-2xl font-semibold text-text text-center mb-10">
        How It Works
      </h2>
      <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
        {steps.map((step) => (
          <div
            key={step.title}
            className="bg-background rounded-2xl shadow-md p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-primary mb-2">
              {step.title}
            </h3>
            <p className="text-text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
