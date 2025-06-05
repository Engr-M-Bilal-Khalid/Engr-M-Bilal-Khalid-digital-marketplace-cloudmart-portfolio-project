import { PlusCircle, ShoppingCart } from 'lucide-react';

export const HeroSection: React.FC = () => {
    return (
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
                    Discover, Buy, and Sell Digital Goods
                </h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in-up delay-200">
                    Your ultimate marketplace for digital assets, software, templates, and more.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-400">
                    <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                        <ShoppingCart className="inline-block mr-2 w-5 h-5" /> Explore Products
                    </button>
                    <button className="border border-white text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300">
                        <PlusCircle className="inline-block mr-2 w-5 h-5" /> Start Selling
                    </button>
                </div>
            </div>
        </section>
    );
};