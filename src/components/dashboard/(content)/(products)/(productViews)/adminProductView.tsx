import ToggleActivationStatusOfProduct from "@/components/dashboard/seller/toggleActivationStatusOfProduct";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Image, Pencil, PowerIcon, PowerOff, RefreshCw, Trash2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from 'react';
import "react-loading-skeleton/dist/skeleton.css";
import ImageSlider from '../../../../ImageSlider';
import { Success } from '../../../seller/productCreation';
import DeleteProduct from "../../../seller/productDeletion";
import { ProductUpdationForm } from '../../../seller/productUpdation';
import { errorNotifier, successNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";
import { ProductViewProps } from "../productContent";
import StatusIconButtonGroup from "@/lib/designPatterns/decoratorPattern/(adminButtonView)/ButtonIconGroup";


interface StatusDropDownI {
    product_id: number;
    fetchProductsAfterStatusChange: () => void
}

function StatusDropDown({ product_id, fetchProductsAfterStatusChange }: StatusDropDownI) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const changeStatus = async (productId: number, value: string) => {
        const response = await fetch('/api/change-status-of-product', {
            method: 'POST',
            body: JSON.stringify({ productId, value })
        });
        const data = await response.json();
        const message = data.message;
        if (response.status === 200) {
            successNotifier.notify(message);
            fetchProductsAfterStatusChange();
        } else {
            errorNotifier.notify(message)
        }
    }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);


    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1"
            >
                {
                    open ? <ChevronUp className="w-4 h-4 text-[#333333] relative top-1 left-1" /> : <ChevronDown className="w-4 h-4 text-[#333333] relative top-1 left-1" />
                }
            </button>

            {open && (
                <div className="flex">
                    <Button className="absolute z-10 top-full right-0 mt-2 bg-[#333333] hover:bg-[#EEE9D1] text-[#EEE9D1] hover:text-green-600  w-[90px] py-1 px-7 rounded text-center transition-colors duration-300 ease-in-out"
                        onClick={() => {
                            setOpen(false);
                            changeStatus(product_id, "approved")
                        }}
                    >
                        Approved
                    </Button>
                    <Button className="absolute z-10 top-full right-0 mt-[45px] bg-[#333333] hover:bg-[#EEE9D1]  text-[#EEE9D1] hover:text-red-600 w-[90px] py-1 px-7 rounded text-center transition-colors duration-300 ease-in-out"
                        onClick={() => {
                            setOpen(false);
                            changeStatus(product_id, "rejected")
                        }}
                    >
                        Reject
                    </Button>
                </div>
            )}
        </div>
    );
}

interface Product {
    product_id: number;
    product_name: string;
    price: number;
    digital_asset_url: string | null;
    created_at: string;
    updated_at: string | null;
    category_name: string;
    email?: string;
    userName: string
    sellCount: number;
    status: string;
    activation_status: string;
}

const AdminProductView = ({ userId, userRole }: ProductViewProps) => {

    const [products, setProducts] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(true);
    const [productError, setproductError] = useState<string | null>(null);
    const [productCreated, setProductCreated] = useState(false);
    const [productUpdated, setProductUpdated] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isOpenDeleteAccount, setIsOpenDeleteAccount] = useState(false);
    const [openProductId, setOpenProductId] = useState<null | number>(null);
    const [activeDialogProductId, setActiveDialogProductId] = useState<number | null>(null);
    const [inActiveDialogProductId, setInActiveDialogProductId] = useState<number | null>(null);


    const fetchProducts = async (value?: string) => {
        value = value?.toLowerCase();
        try {
            const response = await fetch('/api/view-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userRole: userRole,
                    userId: userId,
                    value: value || null
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`);
            }

            const data = await response.json();
            setProducts(data);
            setProductLoading(false);
        } catch (error: any) {
            setproductError(error.message);
            setProductLoading(false);
        }
    };

    const fetchImagesURL = async (productId: number) => {
        console.log(`Images`);
        try {
            const response = await fetch('api/fetch-product-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch product images: ${response.status}`);
            }

            const data = await response.json();
            console.log(data.images);
            const productImages = data.images
            const validUrls = productImages
                .map(({ image_url }: { image_url: string | { url: string } }) =>
                    typeof image_url === 'string' ? image_url : image_url
                )
                .filter(Boolean) as string[]

            if (productImages) {
                setImageUrls(validUrls);
            } else {

                console.warn("API response did not contain an array of imageUrls:", data);
            }
        } catch (error) {
            console.log(error)
            console.error(error);

        }
    }

    const handleImageClick = async (productId: number) => {
        await fetchImagesURL(productId);
    };

    useEffect(() => {
        if ((userRole && userId !== undefined) || productCreated || productUpdated) {
            fetchProducts();
        }
    }, [userRole, userId, productCreated, productUpdated]);


    return (
        <div>
            {/* Main Content */}
            <div className="flex items-center justify-between">
                <h2 className="text-6xl font-extrabold  text-[#333333]">Products</h2>
                <Button className="bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300 p-2 rounded-full transition" onClick={() => fetchProducts()} variant="ghost"><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <p className="mt-2 text-lg transition-colors duration-500 text-[#333333]">Manage sellers products.</p>

            <>
                <div className="mt-2 text-sm transition-colors duration-500 text-[#333333]">
                    <span className="text-red-500">Important Note: {" "}</span>
                    Products that have recorded at least one sale (sellCount greater than zero) cannot be deleted.

                    This policy is in place to ensure the integrity of sales records, maintain historical data for reporting and analytics, and support any potential customer service inquiries related to past transactions.

                    If a product with sales is no longer available or should not be visible on the marketplace, its status can be changed to inactive, rejected, or pending (if a review is needed) to remove it from public view without compromising critical sales data.
                </div>
                <div className="flex justify-end ">
                    <StatusIconButtonGroup fetchProducts={fetchProducts} />
                </div>
                <div className="overflow-auto rounded-xl shadow-md border border-gray-200 mt-5">

                    <Table className="text-sm text-[#333333] bg-white [&_th]:text-center [&_td]:text-center [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-2">
                        <TableCaption className="text-[#333333] text-base pb-3">
                            {
                                products.length === 0 && !productLoading 
                                ?  
                                    <p className="mt-2 text-lg transition-colors duration-500 text-red-500">
                                        {
                                            products.length === 0 ? `No Product Found!` : null
                                        }
                                    </p> 
                                : 
                                    `A list of ${userRole === "seller" ? "your" : "all"} products.`
                            }
                           
                        </TableCaption>

                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead>Seller Name</TableHead>
                                <TableHead>Seller Email</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Times Sold</TableHead>
                                <TableHead>Images</TableHead>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Updated At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                products.length > 0 ?
                                    products.slice().reverse().map((product, index) => (
                                        <TableRow
                                            key={product.product_id}
                                            className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}
                                        >
                                            <TableCell className="font-bold underline">{product.userName}</TableCell>
                                            <TableCell className="text-blue-400">{product.email}</TableCell>
                                            <TableCell>{product.product_name}</TableCell>
                                            <TableCell>${product.price?.toFixed(2)}</TableCell>
                                            <TableCell>{product.sellCount}</TableCell>

                                            <TableCell className="flex items-center space-x-2 justify-end text-right">
                                                <Dialog >
                                                    <DialogTrigger asChild
                                                        className="text-[#333333] hover:text-green-700 hover:scale-110 transition-all duration-200 hover:cursor-pointer" onClick={() => handleImageClick(product.product_id)}
                                                    >
                                                        <Image className="w-4 h-4 " />
                                                    </DialogTrigger>
                                                    <DialogContent style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        maxHeight: '90vh',
                                                        overflowY: 'auto',
                                                    }} >
                                                        <DialogTitle>
                                                            Images of {product.product_name.toUpperCase()}

                                                        </DialogTitle>
                                                        <ImageSlider urls={imageUrls} />  {/* Pass the URLs */}
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                            <TableCell>{product.category_name}</TableCell>
                                            <TableCell>
                                                {
                                                    product.status === 'approved' || product.status === 'rejected' ?
                                                        (
                                                            <span
                                                                className={`text-sm font-medium tracking-wide ${product.status === 'approved' ? 'text-green-700' : 'text-red-600'
                                                                    }`}
                                                            >
                                                                {product.status.toUpperCase()}
                                                            </span>
                                                        )
                                                        :
                                                        (
                                                            <>
                                                                <span className="text-sm text-red-500 font-medium">Pending</span>
                                                                <StatusDropDown product_id={product.product_id} fetchProductsAfterStatusChange={fetchProducts} />
                                                            </>
                                                        )}

                                            </TableCell>
                                            <TableCell>{new Date(product.created_at).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {product.updated_at ? new Date(product.updated_at).toLocaleString() : "N/A"}
                                            </TableCell>
                                            <TableCell className="flex items-center space-x-0 justify-center text-right">

                                                {
                                                    product.activation_status === 'active' ?
                                                        <Dialog
                                                            open={inActiveDialogProductId === product.product_id}
                                                            onOpenChange={(open) => setInActiveDialogProductId(open ? product.product_id : null)}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant='link'
                                                                    className="relative left-3"
                                                                    title={`Decctivate ${product.product_name}`}
                                                                >
                                                                    <PowerOff className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-[425px]">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-red-500">Deactivate {product.product_name}</DialogTitle>
                                                                </DialogHeader>
                                                                <ToggleActivationStatusOfProduct
                                                                    productId={product.product_id}
                                                                    productName={product.product_name}
                                                                    onSuccess={() => setInActiveDialogProductId(null)}
                                                                    fetchProducts={fetchProducts}
                                                                    currentActivationStatus="inactive"
                                                                />
                                                            </DialogContent>
                                                        </Dialog>
                                                        :
                                                        <Dialog
                                                            open={activeDialogProductId === product.product_id}
                                                            onOpenChange={(open) => setActiveDialogProductId(open ? product.product_id : null)}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant='link'
                                                                    className="relative left-3"
                                                                    title={`Activate ${product.product_name}`}
                                                                >
                                                                    <PowerIcon className="h-4 w-4 text-gray-900" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-[425px]">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-gray-600">Activate {product.product_name}</DialogTitle>
                                                                </DialogHeader>
                                                                <ToggleActivationStatusOfProduct
                                                                    productId={product.product_id}
                                                                    productName={product.product_name}
                                                                    onSuccess={() => setActiveDialogProductId(null)}
                                                                    fetchProducts={fetchProducts}
                                                                    currentActivationStatus="active"
                                                                />
                                                            </DialogContent>
                                                        </Dialog>
                                                }






                                                <Dialog open={openProductId === product.product_id} onOpenChange={(open) => setOpenProductId(open ? product.product_id : null)}>
                                                    <DialogTrigger asChild>
                                                        <Button variant='link' className={`text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-200 hover:cursor-pointer ${deletingProductId === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`} title={`Delete ${product.product_name}`} disabled={deletingProductId === product.product_id || product.sellCount > 0}>
                                                            <Trash2 className={cn('h-4 w-4')} />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-red-600">Delete {product.product_name}</DialogTitle>
                                                        </DialogHeader>
                                                        <h1>{product.product_id}</h1>
                                                        <DeleteProduct productId={product.product_id} onSuccess={() => setIsOpenDeleteAccount(false)} fetchProducts={() => fetchProducts()} />
                                                    </DialogContent>
                                                </Dialog>
                                                <Dialog >
                                                    <DialogTrigger asChild
                                                        className="text-green-500 hover:text-green-700 hover:scale-110 transition-all duration-200 hover:cursor-pointer" onClick={() => setProductUpdated(false)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </DialogTrigger>
                                                    <DialogContent style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        maxHeight: '90vh',
                                                        overflowY: 'auto',
                                                    }} >
                                                        <DialogTitle>
                                                            {productUpdated ? "🎉 Product Updated Successfully!" : ` Revise ${product.product_name.toUpperCase()}`}
                                                        </DialogTitle>
                                                        {productUpdated ? (
                                                            <>
                                                                <Success
                                                                    message="Product Updated Successfully!"
                                                                    description="Your product details have been updated."
                                                                    onAction={() => setProductUpdated(false)}
                                                                    titleColor="text-blue-600" // Optional: Change title color
                                                                />
                                                            </>
                                                        ) : (
                                                            <ProductUpdationForm productName={product.product_name} productId={product.product_id} productPrice={product.price} productCategory={product.category_name} onProductUpdated={() => setProductUpdated(true)} />
                                                        )}
                                                    </DialogContent>
                                                </Dialog>

                                            </TableCell>
                                        </TableRow>
                                    )) : null}
                        </TableBody>
                    </Table>
                </div>
            </>


            {productLoading ? (
                <>
                    <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                        <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                    </div>
                </>
            ) : null}
        </div>
    );
}


export default AdminProductView