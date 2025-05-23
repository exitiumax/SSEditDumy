import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const images = [
  {
    url: "https://res.cloudinary.com/davwtxoeo/image/upload/v1747796981/180407_GalinEducation_00981_ci8s6n.jpg",
    alt: "Students studying together"
  },
  {
    url: "https://res.cloudinary.com/davwtxoeo/image/upload/v1747876406/180407_GalinEducation_00150_phazly.jpg",
    alt: "Students in discussion"
  },
  {
    url: "https://res.cloudinary.com/davwtxoeo/image/upload/v1747876397/180407_GalinEducation_00848_ozibz0.jpg",
    alt: "Student receiving guidance"
  },
  {
    url: "https://res.cloudinary.com/davwtxoeo/image/upload/v1747876732/academic-coach_tmc5wk.jpg",
    alt: "Academic coaching session"
  },
  {
    url: "https://res.cloudinary.com/davwtxoeo/image/upload/v1747876723/zachcollegecounseling_sc8yuk.jpg",
    alt: "College counseling session"
  }
];

const Hero: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      id="home" 
      className="pt-24 md:pt-32 pb-16 md:pb-24 bg-[#0085c2]"
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-12 xl:gap-24">
          <div className="w-full xl:w-[45%] text-center xl:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-tight">
              Unlock Your Student's <span className="text-[#FFB546]">Academic</span> Potential
            </h1>
            <p className="mt-4 md:mt-6 text-base md:text-lg 2xl:text-xl text-white/90 max-w-2xl mx-auto xl:mx-0">
              Personalized educational services designed to help students excel academically and prepare for their future. Our expert educators provide the guidance they need to succeed.
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4">
              <Link 
                to="/contact" 
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-[#FFB546] bg-[#FFB546] text-white font-medium rounded-md hover:bg-[#0085c2] hover:border-white transition-colors duration-200"
              >
                Schedule Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a 
                href="#services" 
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-white text-white font-medium rounded-md hover:bg-[#FFB546] hover:border-[#FFB546] transition-colors duration-200"
              >
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="w-full xl:w-[50%]">
            <div className="relative max-w-2xl mx-auto xl:ml-auto xl:mr-0">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#FFB546] rounded-full opacity-20 z-10"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white rounded-full opacity-20 z-10"></div>
              <div className="relative w-full h-[300px] md:h-[400px] xl:h-[500px] 2xl:h-[600px] rounded-2xl shadow-xl overflow-hidden">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImage ? 'opacity-100 z-20' : 'opacity-0 z-10'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImage 
                          ? 'bg-white w-4' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;