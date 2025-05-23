import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimer, setDropdownTimer] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleMouseEnter = (itemName: string) => {
    if (dropdownTimer) clearTimeout(dropdownTimer);
    setActiveDropdown(itemName);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setDropdownTimer(timer);
  };

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsMenuOpen(false);
  };

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        const yOffset = -10;
        const y = servicesSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollToServices: true } });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (location.state?.scrollToServices) {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        const yOffset = -10;
        const y = servicesSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const navigationItems = [
    { name: 'Home', path: '/' },
    {
      name: 'Services',
      path: '/#services',
      dropdownItems: [
        { name: 'College Counseling', path: '/services/college-counseling' },
        { name: 'Graduate Admissions', path: '/services/graduate-admissions' },
        { name: 'Test Prep', path: '/services/test-prep' },
        { name: 'Executive Functioning Coaching', path: '/services/executive-functioning' },
        { name: 'Tutoring', path: '/services/tutoring' }
      ]
    },
    {
      name: 'About',
      path: '/about',
      dropdownItems: [
        { name: 'Our Story', path: '/about/story' },
        { name: 'Results', path: '/about/story/results' },
        { name: 'Team', path: '/about/team' },
      ]
    },
    {
      name: 'Resources',
      dropdownItems: [
        { name: 'Blog', path: '/resources/blog' },
        { name: 'Events', path: '/resources/events' },
      ]
    }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center py-4">
          <Link to="/" onClick={handleNavClick} className="mb-4">
            <img 
              src="https://res.cloudinary.com/davwtxoeo/image/upload/v1747795724/Galin-Small-Color_cjcsvu.png" 
              alt="Galin Education" 
              className="h-12" 
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              onClick={handleNavClick}
              className="px-6 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546] transition-colors duration-200"
            >
              Contact
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-20">
          <Link to="/" onClick={handleNavClick} className="flex-shrink-0">
            <img 
              src="https://res.cloudinary.com/davwtxoeo/image/upload/v1747795724/Galin-Small-Color_cjcsvu.png" 
              alt="Galin Education" 
              className="h-12" 
            />
          </Link>

          <nav className="flex-1 flex justify-center px-8">
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.name === 'Services' ? (
                    <a
                      href="#services"
                      onClick={handleServicesClick}
                      className="text-lg font-medium text-[#0085c2] hover:text-[#FFB546] transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={handleNavClick}
                      className={`text-lg font-medium text-[#0085c2] hover:text-[#FFB546] transition-colors duration-200 ${
                        location.pathname === item.path || 
                        (item.dropdownItems && item.dropdownItems.some(dropItem => location.pathname === dropItem.path))
                          ? 'border-b-2 border-[#FFB546]'
                          : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                  
                  {item.dropdownItems && activeDropdown === item.name && (
                    <div 
                      className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg py-2 w-64"
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex flex-col">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.path}
                            onClick={handleNavClick}
                            className={`block px-4 py-2 text-base text-[#0085c2] hover:text-[#FFB546] transition-colors duration-200 ${
                              location.pathname === dropdownItem.path
                                ? 'border-l-4 border-[#FFB546] bg-gray-50'
                                : ''
                            }`}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              onClick={handleNavClick}
              className="px-6 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546] transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              to="/login"
              onClick={handleNavClick}
              className="p-2 text-[#0085c2] hover:text-[#FFB546] transition-colors duration-200"
              aria-label="Login"
            >
              <LogIn className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="absolute right-0 top-[96px] w-full h-[calc(100vh-96px)] bg-white overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              {navigationItems.map((item) => (
                <div key={item.name} className="space-y-2">
                  {item.name === 'Services' ? (
                    <a
                      href="#services"
                      onClick={handleServicesClick}
                      className="block text-xl font-medium text-[#0085c2] hover:text-[#FFB546]"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={handleNavClick}
                      className={`block text-xl font-medium text-[#0085c2] hover:text-[#FFB546] ${
                        location.pathname === item.path
                          ? 'border-l-4 border-[#FFB546] pl-4'
                          : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                  {item.dropdownItems && (
                    <div className="pl-4 space-y-2">
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          to={dropdownItem.path}
                          onClick={handleNavClick}
                          className={`block text-lg text-[#0085c2] hover:text-[#FFB546] ${
                            location.pathname === dropdownItem.path
                              ? 'border-l-4 border-[#FFB546] pl-4'
                              : ''
                          }`}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-6 border-t border-gray-200">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="flex items-center text-lg text-[#0085c2] hover:text-[#FFB546]"
                >
                  <LogIn className="w-6 h-6 mr-2" />
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
