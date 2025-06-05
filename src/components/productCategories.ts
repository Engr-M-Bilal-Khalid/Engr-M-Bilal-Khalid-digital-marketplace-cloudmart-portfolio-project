import { mock } from "node:test";
import { useState } from "react";

export const mockProductcategories = [
    {
        category_id:1,
        category_name: 'Ebooks',
        description: 'Electronic books in various genres'
    },
    {
        category_id:2,
        category_name: 'Templates',
        description: 'Pre-designed documents and files for different purposes'
    }
];

typeof mockProductcategories;

export const PRODUCT_CATEGORIES = async () => {
    const [categories, setCategories] = useState<typeof mockProductcategories>(mockProductcategories)
    const response = await fetch('/api/fetch-product-categories', {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch product categories');
    }
    const data = await response.json();
    if (response.status === 200) {
        setCategories(data.data);
        console.log('Product categories fetched successfully:', data.data);
        return categories;
    }
}