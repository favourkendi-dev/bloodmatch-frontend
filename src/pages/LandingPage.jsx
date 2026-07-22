import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import Footer from '../components/landing/Footer'

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default LandingPage
