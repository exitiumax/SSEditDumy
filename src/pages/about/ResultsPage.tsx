import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: "The college counseling services at Galin Education were instrumental in helping me get accepted to my dream school. The personalized attention and expert guidance made all the difference.",
    author: "Sarah J.",
    school: "Harvard University '24"
  },
  {
    quote: "Thanks to Galin's test prep program, I improved my SAT score by 200 points. The strategies and practice materials were exactly what I needed.",
    author: "Michael C.",
    school: "Stanford University '25"
  },
  {
    quote: "Working with Galin Education transformed my college application journey. Their guidance was invaluable.",
    author: "Emma L.",
    school: "Yale University '23"
  },
  {
    quote: "The tutoring services helped me excel in my AP classes. I couldn't have done it without their support.",
    author: "David R.",
    school: "Princeton University '24"
  }
];

const successStories = [
  {
    name: "Maggie",
    title: "Maggie's Journey to Tufts",
    image: "https://res.cloudinary.com/davwtxoeo/image/upload/v1747877174/maggie_ysyjsa.jpg",
    preview: "Through personalized counseling and strategic guidance, Maggie gained confidence in the college application process and achieved her dream of attending Tufts University.",
    fullStory: `I thought of it as an extremely daunting process. My older sister had gone through it and she was really stressed her entire senior year. I was nervous about the hard classes I was going to be taking, as well as completing my college applications at the same time.

The most surprising thing about the college counseling process was how easy it was to work with my counselor and how comfortable I was sharing my personal statement. He was very approachable and he worked well with both me and my parents. He gave great advice on all of my essays, and was extremely helpful throughout the entire process.

I found it helpful creating a feasible timeline to make the fall of my senior year less stressful. I was able to complete my personal statement and most of the common applications before school started, and I felt really ahead on my college applications.

My counselor helped me curate a well balanced list with plenty of safety, target, and reach schools that I would be happy to attend. It helped take some pressure off knowing that I would be going somewhere I would want to attend. He also helped me a lot with my supplemental essays.

I will be attending Tufts University next year to study engineering. I am extremely excited as it was one of my top choices. Tufts fits all of my criteria for the kind of school I wanted to go to, and I am so grateful to Galin Education for helping me achieve this accomplishment.`,
    class: "Class of 2028"
  },
  {
    name: "Raju",
    title: "Raju's Dream School",
    image: "https://res.cloudinary.com/davwtxoeo/image/upload/v1747876912/NWU_yaachx.webp",
    preview: "Through personalized counseling and strategic guidance, Raju gained confidence in the college application process and achieved his dream of attending Northwestern University.",
    fullStory: `Before working with my Galin counselor, Ethan, I was daunted by the college application process. I had a lot of misconceptions about what the process would be like, and was overwhelmed by the amount of choices involved in creating a college list. I also wasn't sure how to navigate my application, especially when it came to test scores and extracurriculars.

The most surprising thing about the college counseling process was how stress-free it was. I was actually excited to go to each meeting and discuss my future plans, and my counselor made me feel confident about my college choices and how I was doing in high school. Overall, the counseling process made me feel confident about applying and ready to tackle college.

The most helpful aspect of the college counseling process was how personalized it was. I was able to construct a strong application, highlighting the things I was passionate about rather than trying to fit a script. It was enriching being able to build upon my existing experiences and activities, and being able to talk about those in depth with my counselor.

One example of how my college counselor helped me make personalized plans is when exploring summer programs that related to activities in which I was already involved. I made the decision myself to apply to those programs, but having my counselor's help in preparing my application and expanding my knowledge about each career field was invaluable.

I will be attending Northwestern University next year and I am overjoyed! Northwestern has always been my dream school, and I'm so happy to be able to join a group of intelligent, passionate students as I pursue my studies. Galin was extremely helpful in helping me solidify my decision and feel confident about applying Early Decision.`,
    class: "Class of 2028"
  }
];

const ResultsPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(0);
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const [hoveredStory, setHoveredStory] = useState<number | null>(null);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentTestimonial((prev) => {
      let next = prev + newDirection;
      if (next >= testimonials.length) next = 0;
      if (next < 0) next = testimonials.length - 1;
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Results</h1>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Student Success</h3>
          <p className="text-4xl font-bold text-blue-600 mb-2">95%</p>
          <p className="text-gray-600">Program completion rate</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">College Acceptance</h3>
          <p className="text-4xl font-bold text-blue-600 mb-2">89%</p>
          <p className="text-gray-600">Students accepted to top universities</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Scholarship Awards</h3>
          <p className="text-4xl font-bold text-blue-600 mb-2">$2.5M+</p>
          <p className="text-gray-600">Total scholarships awarded</p>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div className="bg-[#0085c2] text-white rounded-lg p-8 my-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Testimonials</h2>
        <div className="relative h-[200px] overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentTestimonial}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full h-full"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mx-auto max-w-3xl">
                <p className="italic mb-4 text-lg">{testimonials[currentTestimonial].quote}</p>
                <div className="font-semibold">
                  - {testimonials[currentTestimonial].author}, {testimonials[currentTestimonial].school}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors cursor-pointer z-10"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors cursor-pointer z-10"
            onClick={() => paginate(1)}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-white w-4' : 'bg-white/50'
                }`}
                onClick={() => {
                  const direction = index - currentTestimonial;
                  setDirection(direction);
                  setCurrentTestimonial(index);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Student Success Stories */}
      <div className="my-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Student Success Stories</h2>
        <div className="space-y-6 max-w-4xl mx-auto">
          {successStories.map((story, index) => (
            <motion.div 
              key={index}
              layout
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer relative"
              onClick={() => setExpandedStory(expandedStory === index ? null : index)}
              onMouseEnter={() => setHoveredStory(index)}
              onMouseLeave={() => setHoveredStory(null)}
            >
              <motion.div layout className="flex relative">
                <div className="w-1/3 relative h-[200px]">
                  <img 
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div className="w-2/3 p-6">
                  <motion.h3 layout="position" className="text-xl font-semibold text-gray-800 mb-2">
                    {story.title}
                  </motion.h3>
                  <AnimatePresence mode="wait">
                    {expandedStory === index ? (
                      <motion.div
                        key="full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {story.fullStory.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="text-gray-600 mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-gray-600">{story.preview}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="text-[#0085c2] font-semibold mt-4">{story.class}</div>
                </motion.div>
                
                {/* Overlay for hover effect */}
                <AnimatePresence>
                  {hoveredStory === index && expandedStory !== index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center"
                    >
                      <span className="text-white text-2xl font-semibold">
                        Read {story.name}'s Story
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;