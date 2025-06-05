'use client';

import React from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';
import { create } from "domain";
import { CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import { ProductCategory, ApiResponseOfProductCategory } from './productCategories'
import { successNotifier,errorNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";



const productCreationSchema = z.object({
    productName: z.string().min(1, { message: "Product name is required" }),
    productCategory: z.coerce.number().min(1, { message: "Product category is required" }),
    productDescription: z.string().optional(),
    productPrice: z.string()
        .refine((val) => /^\d+$/.test(val), {
            message: 'Price must be a valid number',
        }),
    productImages: z
        .array(z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
            message: 'Max file size is 5MB.',
        }))
        .min(1, { message: 'Please select at least one image.' }),
    digital_asset_file: z
        .any()
        .refine(file => file?.name?.endsWith('.zip'), {
            message: 'Only .zip files are allowed',
        }),
    // productDigitalAssetUrl: z.string().url({ message: "Invalid URL" }),
});

interface ProductCreationFormProps {
    userId: number | undefined,
    onProductCreated: () => void,
}

interface ProductCreationSuccessProps {
    onReset: () => void;
}

interface SuccessProps {
    message: string;
    description: string;
    actionText?: string;
    onAction: () => void;
    titleColor?: string; // Optional: Allow customizing the title color
}


export const ProductCreationForm: React.FC<ProductCreationFormProps> = ({ userId, onProductCreated }) => {

    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [productCreation, setProductCreation] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    const form = useForm<z.infer<typeof productCreationSchema>>({
        resolver: zodResolver(productCreationSchema),
        defaultValues: {
            productName: '',
            productCategory: 0,
            productDescription: '',
            productPrice: '',
            productImages: undefined,
            digital_asset_file: undefined
            // productDigitalAssetUrl: "",
        },
    });

    useEffect(() => {
        console.log("Form Errors:", form.formState.errors);
    }, [form.formState.errors]);

    useEffect(() => {
        setLoading(true);

        const fetchProductCategories = async () => {
            try {
                const res = await fetch('/api/fetch-product-categories', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error('Failed to fetch product categories:', errorData);
                    return;
                }

                const data: ApiResponseOfProductCategory = await res.json();
                setCategories(data.data || []);

            } catch (error) {
                console.error('Error fetching product categories:', error);

            } finally {
                setLoading(false);
            }
        };

        fetchProductCategories();
    }, []);


    async function onSubmit(values: z.infer<typeof productCreationSchema>) {
        console.log(values);
        setProductCreation(true); // Start loading state
        setResultMessage('');

        const createProduct = async () => {
            let errorOccurred = false;
            const formData = new FormData();

            // Append text fields to FormData
            formData.append('productName', values.productName);
            formData.append('productCategory', String(values.productCategory)); // Convert to string
            formData.append('productDescription', values.productDescription || '');
            formData.append('productPrice', values.productPrice);
            formData.append('userId', String(userId)); // Convert userId to string
            formData.append('asset_folder',values.digital_asset_file);

            // Append image files to FormData
            values.productImages.forEach(image => {
                formData.append('images', image);
            });

            try {
                const res = await fetch('/api/create-products', {
                    method: 'POST',
                    body: formData, // Send FormData, don't set Content-Type
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    console.error('Failed to create product :', errorData);
                    errorNotifier.notify('Something went wrong ! Please try again');
                    errorOccurred = true;
                    return;
                }
                const data = await res.json();
                console.log('Product created successfully:', data);
                successNotifier.notify('Product created successfully save in db and in stripe dashboard!');
            } catch (error) {
                console.error('Error creating product :', error);
                errorOccurred = true;
                toast.error('Something went wrong! Please try again.');

            } finally {
                setProductCreation(false); // End loading state
                setResultMessage(errorOccurred ? 'Product creation failed' : 'Product created successfully'); // Set result message
                form.reset();
                onProductCreated();
            }
        }
        createProduct();
    }




    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name * </FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Product Name" {...field} className="mt-1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="productImages"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload Product Images *</FormLabel>

                                <FormControl>
                                    <Input
                                        placeholder="Upload Product Images"
                                        className="mt-1"
                                        type="file"
                                        multiple
                                        onChange={(e) => field.onChange(e.target.files ? Array.from(e.target.files) : [])}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                    />

                                </FormControl>

                                <FormMessage className="text-sm text-gray-400 mt-1">Drag & drop or click to select images <br /> Max size: ~5MB each <br/> <span className="text-lg text-red-600">You can't update images later!</span> </FormMessage>
                            </FormItem>
                        )} />

                    <FormField
                        control={form.control}
                        name="digital_asset_file"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel >Asset file *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Upload Digital Asset"
                                        id="file"
                                        type="file"
                                        accept=".zip"
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                        name={field.name}
                                    />
                                </FormControl>
                                <FormMessage className="text-sm text-gray-400 mt-1">Upload .zip folder containing digital asset <br/> <span className="text-lg text-red-600">You can't update asset folder later!</span></FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="productCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Category *</FormLabel>
                                <Select onValueChange={field.onChange} value={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.category_id} value={String(category.category_id)}>
                                                {loading ? (
                                                    <div className="flex justify-center items-center py-4">
                                                        <Loader2 className="animate-spin text-gray-500" />
                                                    </div>
                                                ) : (
                                                    category.category_name // Display the category name when not loading
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>

                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="productDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Description </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter Product Description (Max 50 characters)"
                                        {...field}
                                        className="mt-1 resize-none"
                                        maxLength={50}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="productPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Price *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Product Price" {...field} className="mt-1" type="number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className='bg-gradient-to-br from-blue-50 to-blue-700 text-slate-950' disabled={productCreation} >Launch</Button>
                </form>
            </Form>
        </>
    )
};


export function Success({ message, description, actionText, onAction, titleColor = "text-green-600" }: SuccessProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-4">
            <CheckCircle className={`${titleColor === "text-green-600" ? "text-green-500" : "text-blue-500"} w-12 h-12 animate-bounce`} />
            <h2 className={`text-xl font-semibold ${titleColor}`}>
                {message}
            </h2>
            <p className="text-gray-600 max-w-sm">
                {description}
            </p>
            {
                actionText ? <Button onClick={onAction} className="mt-4 bg-gradient-to-br from-blue-50 to-blue-700 text-slate-950 transition">
                    {actionText}
                </Button> : null
            }
        </div>
    );
}



