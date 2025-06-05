import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorNotifier, successNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiResponseOfProductCategory, ProductCategory } from './productCategories';


interface ProductUpdationFormProps {
    productId: number,
    productName:string,
    productCategory:string,
    productPrice:number
    onProductUpdated: () => void,
}

const productUpdationSchema = z.object({
    productId: z.coerce.number().int().min(1, { message: "Product ID is required" }),
    productName: z.string(),
    productCategory: z.string(),
    productPrice: z.coerce.number().int(),
    // productDigitalAssetUrl: z.string().url({ message: "Invalid URL" }),
});

type ProductUpdationSchema = z.infer<typeof productUpdationSchema>;

export const ProductUpdationForm: React.FC<ProductUpdationFormProps> = ({ productId, productName, productCategory, productPrice ,onProductUpdated }) => {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [productUpdation, setProductUpdation] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    const form = useForm<ProductUpdationSchema>({
        resolver: zodResolver(productUpdationSchema),
        defaultValues: {
            productId: productId,
            productName: productName,
            productCategory: productCategory,
            productPrice: productPrice,
            // productDigitalAssetUrl: "",
        },
    });

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


    async function onSubmit(values: z.infer<typeof productUpdationSchema>) {
        
        let productId:number,productName:string,productPrice:number,productDescription:string|undefined,productCategoryId: number

        productId = values.productId;
        productName = values.productName;
        productPrice = values.productPrice;
        productCategoryId = Number(values.productCategory);
        
        setProductUpdation(true);

        const updateProduct = async () => {
            let errorOccurred = false;
            try {
                const res = await fetch('/api/update-products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                       productId,productName,productPrice,productDescription,productCategoryId
                    })
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    errorNotifier.notify('Something went wrong ! Please try again');
                    console.error('Failed to update product :', errorData);
                    errorOccurred = true;
                    return;
                }
                const data = await res.json();
                console.log('Product update successfully:', data);

                successNotifier.notify('Product updated successfully!');

            } catch (error) {
                console.error('Error updating product :', error);
                errorOccurred = true;     
            } finally {
                setProductUpdation(false);
                setResultMessage(errorOccurred ? 'Product updation failed' : 'Product updated successfully'); 
                form.reset();
                onProductUpdated()
            }
        }
        updateProduct();
    }
    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                            <FormControl>
                                <Input type="hidden"  {...field} />
                            </FormControl>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Product Name" {...field} className="mt-1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="productCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Category  <span className="font-normal text-amber-400">{productCategory}</span></FormLabel>
                                <Select value={String(field.value)} onValueChange={field.onChange} >
                                    <FormControl>
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue></SelectValue>
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
                        name="productPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Price</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Product Price" {...field} className="mt-1" type="number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="bg-gradient-to-br from-blue-50 to-blue-700 text-slate-950" disabled={productUpdation} >Revise Product</Button>
                </form>
            </Form>
        </>
    )
}