export interface ProductCategory {
    category_id: number;
    category_name: string;
    description: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface ApiResponseOfProductCategory {
    data: ProductCategory[]
}