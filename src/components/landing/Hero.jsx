import { Link } from 'react-router-dom'

function Hero() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col items-center text-center px-6 py-20 bg-background">
      <h1 className="text-4xl font-bold text-primary mb-4">
        BloodMatch
      </h1>
      <p className="text-lg text-text-muted max-w-xl mb-8">
        Connecting blood donors with hospitals in need, faster.
      </p>
      <div className="flex gap-4 mb-4">
        <Link
          to="/register"
          className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition"
        >
          Get Started
        </Link>
        <button
          type="button"
          onClick={scrollToHowItWorks}
          className="bg-white text-primary border border-primary font-semibold px-6 py-3 rounded-full transition"
        >
          Learn More
        </button>
      </div>
      <p className="text-text-muted text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Log In
        </Link>
      </p>
    </section>
  )
}

export default Hero
