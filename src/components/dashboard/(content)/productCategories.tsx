import { DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Dialog } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCategoryCreationForm } from "../owner/productCategoryForm";
import { ApiResponseOfProductCategory, ProductCategory } from "../seller/productCategories";


interface PCP {
    userId?: number,
    userRole?: string
}

export const ProductCategoriesContent = ({ userId, userRole }: PCP) => {

    const [loading, setLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const fetchProductCategories = async () => {
        setLoading(true);
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
            console.log(data)

        } catch (error) {
            console.error('Error fetching product categories:', error);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductCategories();
    }, []);

    const [open, setOpen] = useState(false);


    return (
        userRole === 'admin'
            ?
            <div className="">
                <div className="flex items-center justify-between">
                    <h2 className="text-5xl font-extrabold transition-colors duration-500 text-[#333333]">Product Categories</h2>
                    <>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger className="flex bg-black  text-white  py-2 px-4 rounded-md transition-colors duration-300" onClick={() => setOpen(true)}>
                                <Plus className="h-4 w-4 mt-1 mr-1" />
                                Add New Product Category
                            </DialogTrigger>
                            <DialogContent style={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                            }} onInteractOutside={(event) => event.preventDefault()}>
                                <DialogTitle>
                                    Add New Product Category
                                    <ProductCategoryCreationForm closeDialog={() => setOpen(false)} fetchProductCategories={fetchProductCategories} />
                                </DialogTitle>

                            </DialogContent>
                        </Dialog>
                    </>
                </div>
                {
                    !loading ?
                        <div className="overflow-auto rounded-xl shadow-md border border-gray-200  mt-5">
                            <Table className="text-sm text-[#333333] bg-white [&_th]:text-center [&_td]:text-center [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-2">
                                <TableCaption className="text-[#333333] text-base pb-3">A list of your product categories.</TableCaption>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="w-[100px]">S No</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Created At</TableHead>
                                        <TableHead className="text-right">Updated At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category, index) => (
                                        <TableRow key={category.category_id} className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{category.category_id}</TableCell>
                                            <TableCell>{category.category_name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
                                            <TableCell className="text-right">{new Date(category.created_at).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">{category.updated_at ? category.updated_at : "N/A"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        :
                        <>
                            <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                                <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                            </div>
                        </>
                }

            </div>
            : null


    )
};