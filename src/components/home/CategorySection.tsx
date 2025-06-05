"use client"
import { errorNotifier, successNotifier } from '@/lib/designPatterns/observerPattern/notificationTrigger';
import {  BookOpen, BoxIcon, LayoutGrid, MonitorPlay } from 'lucide-react'; // Added Menu for mobile
import { useEffect, useState } from 'react';
import { set } from 'zod';



interface CategoryCardProps {
     icon: React.ElementType; // Lucide icon component
    category_name: string;
    description: string;
}


export const CategoryCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center animate-pulse">
            <div className="bg-gray-200 w-16 h-16 rounded-full mb-4"></div> {/* Icon placeholder */}
            <div className="bg-gray-200 h-6 w-3/4 rounded-md mb-2"></div> {/* Title placeholder */}
            <div className="bg-gray-200 h-4 w-full rounded-md mb-2"></div> {/* Description line 1 */}
            <div className="bg-gray-200 h-4 w-5/6 rounded-md"></div> {/* Description line 2 */}
            <div className="bg-gray-200 h-4 w-1/3 rounded-md mt-4"></div> {/* Link placeholder */}
        </div>
    );
};

const CategoryCard: React.FC<CategoryCardProps> = ({ icon:Icon ,category_name, description }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 hover:shadow-xl">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                <Icon className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{category_name}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
            <a href="#" className="mt-4 text-blue-600 hover:underline text-sm font-medium">View All &rarr;</a>
        </div>
    );
};



export const CategorySection: React.FC = () => {
    const staticIcons: React.ElementType[] = [BookOpen, BoxIcon, LayoutGrid, MonitorPlay ]; 

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryCardProps[]>([]);
    const fetchProductCategories = async () => {
        setLoading(true);
        const response = await fetch('/api/fetch-product-categories', {
            method: 'POST',
            body: JSON.stringify({ limit: 1 })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.status === 200) {
                const categoriesRecords = data.data;
                console.log('Fetched Categories:', categoriesRecords);
                setCategories(categoriesRecords)
                setLoading(false);
                successNotifier.notify(data.message)
            } else {
                errorNotifier.notify('Products categories failed to fetch up to limit')
            }

        }
    };

    useEffect(() => {
        fetchProductCategories();
    }, [])

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                    Explore Our Top Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        // Render skeletons while loading
                        Array.from({ length: 4 }).map((_, index) => (
                            <CategoryCardSkeleton key={index} />
                        ))
                    ) : (
                        // Render actual category cards when loaded
                        categories.map((category, index) => (
                        <CategoryCard key={index} icon={staticIcons[index % staticIcons.length]} category_name={category.category_name} description={category.description} />
                    ))
                    )}
                    
                </div>
            </div>
        </section>
    );
};