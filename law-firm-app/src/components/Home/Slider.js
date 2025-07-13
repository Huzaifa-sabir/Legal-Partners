import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1676181739859-08330dea8999?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Excellence in Legal Representation",
      subtitle: "Trusted by thousands of clients nationwide",
      description: "Our experienced legal team delivers outstanding results with personalized attention to every case, ensuring your rights are protected."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Professional Legal Expertise",
      subtitle: "Decades of combined legal experience",
      description: "From complex litigation to corporate counsel, our attorneys bring deep knowledge and strategic thinking to every legal challenge."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1617203443952-6d2619f7ff4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Justice Through Technology",
      subtitle: "Modern solutions for legal excellence",
      description: "Leveraging cutting-edge technology and traditional legal wisdom to deliver efficient, effective representation for our clients."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1447968954315-3f0c44f7313c?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Your Legal Success Partners",
      subtitle: "Dedicated advocacy for your rights",
      description: "Building lasting relationships with our clients through transparent communication, strategic counsel, and unwavering commitment to justice."
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="slider-container">
      {/* Slides Container */}
      <div 
        className="slider-wrapper"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="slider-slide"
          >
            {/* Background Image */}
            <div
              className="slider-background"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay */}
              <div className="slider-overlay"></div>
            </div>

            {/* Content */}
            <div className="slider-content">
              <div className="container mx-auto px-4">
                <div className="slider-text">
                  <div className="slider-animation">
                    <h2 className="slider-subtitle">
                      {slide.subtitle}
                    </h2>
                    <h1 className="slider-title">
                      {slide.title}
                    </h1>
                    <p className="slider-description">
                      {slide.description}
                    </p>
                    <div className="slider-actions">
                      <button className="btn btn-primary btn-lg">
                        Schedule Consultation
                      </button>
                      <button className="btn btn-secondary btn-lg slider-btn-secondary">
                        Learn About Our Services
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="slider-navigation">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="slider-nav-btn slider-nav-prev"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="slider-nav-btn slider-nav-next"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="slider-controls">
        {/* Slide Indicators */}
        <div className="slider-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`slider-indicator ${
                index === currentSlide ? 'active' : ''
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="slider-play-pause"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="slider-progress-container">
        <div 
          className={`slider-progress-bar ${isPlaying ? 'animated' : ''}`}
          key={currentSlide}
        />
      </div>

      {/* Slider Styles */}
      <style jsx>{`
        .slider-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }
        
        .slider-wrapper {
          display: flex;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
        }
        
        .slider-slide {
          width: 100%;
          height: 100%;
          flex-shrink: 0;
          position: relative;
        }
        
        .slider-background {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: brightness(0.7);
        }
        
        .slider-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 40%, rgba(0, 0, 0, 0.3) 100%);
        }
        
        .slider-content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .slider-text {
          max-width: 900px;
          color: white;
        }
        
        .slider-animation {
          transform: translateY(0);
          opacity: 1;
          transition: all 1.2s ease-out;
        }
        
        .slider-subtitle {
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #fbbf24;
          margin-bottom: 1.5rem;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 2rem;
          color: white;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
        
        .slider-description {
          font-size: 1.375rem;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          color: rgba(255, 255, 255, 0.95);
          max-width: 700px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .slider-btn-secondary {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 2px solid rgba(255, 255, 255, 0.8) !important;
          color: white !important;
          backdrop-filter: blur(10px);
        }
        
        .slider-btn-secondary:hover {
          background: white !important;
          color: #1f2937 !important;
          border-color: white !important;
        }
        
        .slider-navigation {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3rem;
          pointer-events: none;
        }
        
        .slider-nav-btn {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 1.25rem;
          border-radius: 50%;
          transition: all 0.4s ease;
          backdrop-filter: blur(15px);
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .slider-nav-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.6);
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .slider-controls {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .slider-indicators {
          display: flex;
          gap: 0.75rem;
        }
        
        .slider-indicator {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.6);
          background: transparent;
          cursor: pointer;
          transition: all 0.4s ease;
        }
        
        .slider-indicator.active {
          background: white;
          border-color: white;
          transform: scale(1.3);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .slider-indicator:hover:not(.active) {
          border-color: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
        }
        
        .slider-play-pause {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 1rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.4s ease;
          backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .slider-play-pause:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.6);
          transform: scale(1.05);
        }
        
        .slider-progress-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .slider-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
          width: 0%;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
        }
        
        .slider-progress-bar.animated {
          animation: progressBar 5s linear;
        }
        
        @keyframes progressBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @media (min-width: 640px) {
          .slider-actions {
            flex-direction: row;
          }
        }
        
        @media (max-width: 1024px) {
          .slider-title {
            font-size: 3rem;
          }
          
          .slider-description {
            font-size: 1.25rem;
          }
          
          .slider-navigation {
            padding: 0 2rem;
          }
        }
        
        @media (max-width: 768px) {
          .slider-title {
            font-size: 2.5rem;
          }
          
          .slider-description {
            font-size: 1.125rem;
          }
          
          .slider-navigation {
            padding: 0 1rem;
          }
          
          .slider-nav-btn {
            padding: 1rem;
          }
          
          .slider-controls {
            bottom: 2rem;
            gap: 1rem;
          }
          
          .slider-subtitle {
            font-size: 0.875rem;
          }
        }
        
        @media (max-width: 480px) {
          .slider-title {
            font-size: 2rem;
          }
          
          .slider-description {
            font-size: 1rem;
          }
          
          .slider-actions {
            gap: 0.75rem;
          }
          
          .btn {
            padding: 0.875rem 1.5rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Slider;