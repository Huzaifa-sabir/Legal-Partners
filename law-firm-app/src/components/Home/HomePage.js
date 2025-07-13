import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Shield, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  ArrowRight,
  CheckCircle,
  Gavel,
  Menu,
  X
} from 'lucide-react';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1676181739859-08330dea8999?q=80&w=1170&auto=format&fit=crop",
      title: "Excellence in Legal Representation",
      subtitle: "Trusted by thousands of clients nationwide",
      description: "Our experienced legal team delivers outstanding results with personalized attention to every case."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=1170&auto=format&fit=crop",
      title: "Professional Legal Expertise",
      subtitle: "Decades of combined legal experience",
      description: "From complex litigation to corporate counsel, our attorneys bring deep knowledge to every challenge."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1617203443952-6d2619f7ff4e?q=80&w=1170&auto=format&fit=crop",
      title: "Justice Through Technology",
      subtitle: "Modern solutions for legal excellence",
      description: "Leveraging cutting-edge technology and traditional legal wisdom for efficient representation."
    }
  ];

  const features = [
    {
      icon: <Gavel className="w-12 h-12 text-blue-600" />,
      title: "Expert Legal Counsel",
      description: "Our experienced attorneys provide comprehensive legal guidance with proven results and personalized attention."
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: "Policy Management",
      description: "Streamlined legal processes and compliance monitoring to protect your interests and ensure peace of mind."
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Client-Focused Service",
      description: "Dedicated support with transparent communication and unwavering commitment to your legal success."
    }
  ];

  const practiceAreas = [
    "Corporate Law",
    "Personal Injury", 
    "Real Estate Law",
    "Family Law",
    "Criminal Defense",
    "Employment Law"
  ];

  // Auto-advance slides
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Smooth scroll to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Scale className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white">Legal Partners</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('about')} className="text-white hover:text-blue-300 transition-colors font-medium">About</button>
              <button onClick={() => scrollToSection('services')} className="text-white hover:text-blue-300 transition-colors font-medium">Services</button>
              <button onClick={() => scrollToSection('contact')} className="text-white hover:text-blue-300 transition-colors font-medium">Contact</button>
            </div>
            
            <div className="hidden md:flex space-x-4">
              <Link 
                to="/login"
                className="px-6 py-3 text-white border border-white/30 rounded-lg hover:bg-white hover:text-gray-900 transition-all inline-block text-center"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all inline-block text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg mt-2 p-4 mx-4">
              <div className="flex flex-col space-y-3">
                <button onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }} className="text-gray-800 hover:text-blue-600 font-medium py-2 text-left">About</button>
                <button onClick={() => { scrollToSection('services'); setMobileMenuOpen(false); }} className="text-gray-800 hover:text-blue-600 font-medium py-2 text-left">Services</button>
                <button onClick={() => { scrollToSection('contact'); setMobileMenuOpen(false); }} className="text-gray-800 hover:text-blue-600 font-medium py-2 text-left">Contact</button>
                <hr className="border-gray-200" />
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 hover:text-blue-600 font-medium text-left py-2 block">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="bg-blue-600 text-white px-4 py-3 rounded-lg text-center mt-2 block">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Slider */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-transparent" />
            </div>
          ))}
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <p className="text-amber-400 text-sm font-semibold tracking-wide uppercase mb-6">
                {slides[currentSlide].subtitle}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
                {slides[currentSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Schedule Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Legal Partners?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We combine decades of legal expertise with modern technology to deliver 
              exceptional service and results for our clients.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="mb-8 flex justify-center">
                  <div className="p-8 bg-blue-50 rounded-3xl group-hover:bg-blue-100 transition-all duration-300 group-hover:scale-105">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Areas Section */}
      <section id="services" className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Practice Areas
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive legal services across multiple practice areas to meet 
              all your legal needs under one roof.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {practiceAreas.map((area, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {area}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => scrollToSection('contact')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Schedule Free Consultation
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of satisfied clients who trust Legal Partners for their legal needs. 
            Experience professional legal service with integrity and excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-all"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-all"
            >
              Client Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-gray-600">
              Get in touch with our legal experts for professional consultation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Phone</h3>
              <p className="text-gray-900 font-semibold mb-1">+1 (555) 123-4567</p>
              <p className="text-gray-500 text-sm">Mon-Fri 9AM-6PM EST</p>
            </div>
            
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email</h3>
              <p className="text-gray-900 font-semibold mb-1">contact@legalpartners.com</p>
              <p className="text-gray-500 text-sm">24/7 Response Time</p>
            </div>
            
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Address</h3>
              <p className="text-gray-900 font-semibold">
                123 Legal Street<br />
                Suite 500<br />
                City, State 12345
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">Legal Partners</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Professional legal services with integrity and excellence. 
                Serving clients nationwide with dedication and expertise.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-white transition-colors text-left">About</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-gray-400 hover:text-white transition-colors text-left">Services</button></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Practice Areas</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Corporate Law</li>
                <li className="text-gray-400">Personal Injury</li>
                <li className="text-gray-400">Real Estate</li>
                <li className="text-gray-400">Family Law</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">&copy; 2025 Legal Partners. All rights reserved.</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                <p className="flex items-center text-gray-400 text-sm">
                  <Phone className="w-4 h-4 mr-2 text-blue-400" />
                  +1 (555) 123-4567
                </p>
                <p className="flex items-center text-gray-400 text-sm">
                  <Mail className="w-4 h-4 mr-2 text-blue-400" />
                  contact@legalpartners.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;