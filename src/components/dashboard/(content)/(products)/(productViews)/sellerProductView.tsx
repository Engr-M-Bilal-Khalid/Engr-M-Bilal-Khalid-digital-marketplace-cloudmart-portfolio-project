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
import { Image, Pencil, Plus, PowerIcon, PowerOff, Trash2 } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import "react-loading-skeleton/dist/skeleton.css";
import ImageSlider from '../../../../ImageSlider';
import { ProductCreationForm, Success } from '../../../seller/productCreation';
import DeleteProduct from "../../../seller/productDeletion";
import { ProductUpdationForm } from '../../../seller/productUpdation';
import { cn } from "@/lib/utils";
import { ProductViewProps } from "../productContent";
import ToggleActivationStatusOfProduct from "@/components/dashboard/seller/toggleActivationStatusOfProduct";


interface Product {
  product_id: number;
  user_id: number;
  category_id: number;
  product_name: string;
  description: string;
  price: number;
  digital_asset_url: string | null;
  created_at: string;
  updated_at: string | null;
  category_name: string;
  email?: string;
  sellCount: number,
  activation_status: string;
}


const SellerProductView = ({ userId, userRole }: ProductViewProps) => {

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


  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/view-products', {
        method: 'POST', // Send POST request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRole: userRole,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
      console.log(data)
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
        setImageUrls(validUrls); // Update the state
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
        <h2 className="text-6xl font-extrabold transition-colors duration-500 text-[#333333]">Products</h2>
        <>
          <Dialog>
            <DialogTrigger className="flex bg-gradient-to-br from-blue-200 to-blue-700 text-slate-950  py-2 px-4 rounded-md transition-colors duration-300" onClick={() => setProductCreated(false)}>
              <Plus className="h-4 w-4 mt-1 mr-1" />
              Create New Product
            </DialogTrigger>
            <DialogContent style={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflowY: 'auto',
            }} onInteractOutside={(event) => event.preventDefault()}>
              <DialogTitle>
                {productCreated ? "🎉 Product Created Successfully!" : "Let’s Get Your Product Live!"}
              </DialogTitle>
              {productCreated ? (
                <>
                  <Success
                    message="Product Created Successfully!"
                    description="Your product is now live. You can create another product if you want."
                    actionText="Create Another Product"
                    onAction={() => setProductCreated(false)}
                  />
                </>
              ) : (
                <ProductCreationForm
                  userId={userId}
                  onProductCreated={() => setProductCreated(true)}
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      </div>
      <p className="mt-2 text-lg transition-colors duration-500 text-[#333333]">Manage your products.</p>
      {products.length > 0 ? (
        <div className="overflow-auto rounded-xl shadow-md border border-gray-200  mt-5">

          <Table className="text-sm text-[#333333] bg-white [&_th]:text-center [&_td]:text-center [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-2">
            <TableCaption className="text-[#333333] text-base pb-3">
              A list of {userRole === "seller" ? "your" : "all"} products.
            </TableCaption>

            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Times Sold</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Download Digital Asset</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.slice().reverse().map((product, index) => (
                <TableRow
                  key={product.product_id}
                  className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}
                >
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
                  <TableCell>
                    <Link
                      href={product.digital_asset_url ? product.digital_asset_url : '/'}
                      download
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </Link>
                  </TableCell>
                  <TableCell>Ebooks</TableCell>
                  <TableCell>{new Date(product.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {product.updated_at ? new Date(product.updated_at).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell className="flex items-center space-x-2 justify-end text-right">
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
                    <Dialog open={isOpenDeleteAccount} onOpenChange={setIsOpenDeleteAccount}>
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
                        <DeleteProduct productId={product.product_id} onSuccess={() => setIsOpenDeleteAccount(false)} fetchProducts={() => fetchProducts()} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : ''}
      {productLoading ? (
        <>
          <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
            <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
          </div>
        </>
      ) : <p className="mt-2 text-lg transition-colors duration-500">No products found.</p>}
    </div>
  );
}


export default SellerProductView