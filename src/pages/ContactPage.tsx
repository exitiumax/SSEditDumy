import React from 'react';
import ContactForm from '../components/ContactForm';
import LocationCard from '../components/LocationCard';

const locations = [
  {
    name: 'Madison',
    address: '5102 Silvertree Run, Madison, WI 53705',
    phone: '(608) 841-1053',
    email: 'info@galined.com'
  },
  {
    name: 'Milwaukee',
    address: '10555 North Port Washington Road, Mequon, WI 53092',
    phone: '(608) 841-1053',
    email: 'info@galined.com'
  },
  {
    name: 'San Francisco',
    address: '1328 4th St., San Rafael, CA 94901',
    phone: '(415) 846-6243',
    email: 'info@galined.com'
  }
];

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Contact Form Section */}
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">Get in Touch</h2>
            <ContactForm />
          </div>
          
          {/* Locations Section */}
          <div className="w-full md:w-1/2 bg-[#0085c2] rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center md:text-left">Our Locations</h2>
            <div className="space-y-8">
              {locations.map((location, index) => (
                <LocationCard key={index} {...location} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;