import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiCheckCircle, FiTrendingUp, FiAward, FiGithub, FiCpu } from 'react-icons/fi';
const features = [
  {
    icon: <FiCode className="w-6 h-6" />,
    title: 'Practice Coding',
    description: 'Access a vast collection of coding problems from various platforms.'
  },
  {
    icon: <FiCheckCircle className="w-6 h-6" />,
    title: 'Track Progress',
    description: 'Monitor your progress and see your improvement over time.'
  },
  {
    icon: <FiTrendingUp className="w-6 h-6" />,
    title: 'Performance Analytics',
    description: 'Detailed analytics to help you understand your strengths and weaknesses.'
  },
  {
    icon: <FiAward className="w-6 h-6" />,
    title: 'Achievements',
    description: 'Earn badges and certificates as you complete challenges.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    content: 'Code-Tracker helped me prepare for technical interviews and land my dream job!',
    image: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Full Stack Developer',
    content: 'The progress tracking and analytics features are incredibly helpful for improving my skills.',
    image: 'https://randomuser.me/api/portraits/men/2.jpg'
  }
];

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-90"></div>
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0tMSAxaDIydjIySC0xeiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-20"></div>
        </div>
        
        
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <FiCpu className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold">Code-master</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-white hover:text-white transition">Login</Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 transition text-white"
            >
              Get Started
            </Link>
          </div>
        </nav>

        
        <div className="relative z-10 px-6 py-32 md:py-48 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Daily Goals, Daily Growth
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Track your progress, tackle daily tasks, and become more organized with our comprehensive task management platform.            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <Link
                to="/register"
                className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition shadow-lg text-white"
              >
               Your Daily Success Plan
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      
      <div className="w-full py-24 px-6 max-w-7xl mx-auto backdrop-blur-sm bg-white/5 rounded-3xl my-12 mx-4 sm:mx-8">
        <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition"
            >
              <div className="w-12 h-12 rounded-full bg-teal-600/20 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="w-full py-24 px-6 bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 rounded-2xl bg-gray-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of developers who are improving their coding skills with Code-Tracker.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <Link
                to="/register"
                className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition shadow-lg text-white"
              >
                Get Started for Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-6 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FiCpu className="w-6 h-6 text-teal-400" />
            <span className="text-xl font-bold">Code-Master</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition">About</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Features</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Contact</a>
            <a
              href="https://github.com/enowjohn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition"
            >
              <FiGithub className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
