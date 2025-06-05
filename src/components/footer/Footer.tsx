import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    // fixed bottom-0 w-full z-50
    <footer className="bg-white bg-opacity-20 text-blue-800 py-3  shadow-lg"> {/* Added bg-opacity-20 */}
      <div className="container mx-auto px-4 flex flex-col items-center justify-between md:flex-row">
        {/* Social Icons */}
        <div className="flex space-x-4 mb-2 md:mb-0">
          <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright and Created By */}
        <div className="text-center text-blue-700 text-xs">
          <p>&copy; {new Date().getFullYear()} Devnity.dev All rights reserved.</p>
          <p className="mt-0.5">Created by M Bilal Khalid</p>
        </div>
      </div>
    </footer>
  );
};