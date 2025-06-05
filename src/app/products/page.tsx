'use client';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ImageSlider from "@/components/ImageSlider";
import MaxWidthWrapper from "@/components/navbar/MaxWidthWrapper";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  sellerId: number;
  stripeSellerAccountId: string;
  stripeProductId: string;
  stripePriceId: string;
  digital_asset_url: string;
  image_urls: string[];
}

interface CartItem extends Product {
  quantity: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'Usd',
  }).format(amount);
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadNow, setLoadNow] = useState(false)
  const router = useRouter();



  useEffect(() => {

    const checkSession = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.status === 200) {
          setLoadNow(true)
        }
        if (response.status === 401) {
          console.warn('Session expired. Redirecting to sign-in...');
          window.location.href = '/sign-in';
        }
      } catch (error) {
        console.error('Error checking session:', error);
        window.location.href = '/sign-in';
      }
    };

    checkSession();

    const viewproducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/view-products', { // Corrected path
          method: 'GET',
        });

        if (!res.ok) {
          setError(`Error fetching products: ${res.status}`);
          return;
        }

        const data = await res.json();
        if (data && data.result) {
          setProducts(data.result);
        } else {
          setError("Invalid data format received.");
        }
      } catch (err: any) {
        setError(`Error during fetch: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    viewproducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.product_id === product.product_id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    toast.success(`${product.product_name} ${product.stripeSellerAccountId} added to cart!`);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter(item => item.product_id !== productId));
    toast.success(`Item removed from cart!`);
  };

  const handleIncreaseQuantity = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.product_id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData?.error || 'Failed to initiate checkout.');
        return;
      }

      const data = await response.json();

      if (data?.url) {
        router.push(data.url); // Redirect to single Stripe Checkout session
      } else if (data?.urls && Array.isArray(data.urls) && data.urls.length > 0) {
        // Handle multiple checkout sessions sequentially
        const redirectToCheckout = async (urls: string[]) => {
          if (urls.length > 0) {
            router.push(urls[0]);
            // You might want to listen for the user to return from the session
            // and then redirect to the next URL in the array.
            // This can get complex with user navigation, so consider a different UI.
            // One approach is to open each URL in a new tab.
            urls.forEach(url => window.open(url, '_blank'));
            toast.info('You will be redirected to separate checkout pages for each seller.');
          }
        };
        redirectToCheckout(data.urls);
      } else {
        toast.error('Invalid checkout response received.');
      }
    } catch (error: any) {
      toast.error(`Error initiating checkout: ${error.message}`);
    }
  };



  if (loadNow) {
    if (loading) {
      return <div className="text-center py-8">Loading products...</div>;
    }

    if (error) {
      return <div className="text-red-500 text-center py-8">{error}</div>;
    }
    return (
      <MaxWidthWrapper>
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-4">Our Products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.product_id}>
                <CardHeader>
                  <p className="font-serif">{product.product_name}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden">
                    <ImageSlider urls={product.image_urls} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {product.description}
                  </p>
                  <p className="text-xl font-bold">{formatCurrency(product.price)}</p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button onClick={() => handleAddToCart(product)}>Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {cartItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
              <ul className="space-y-3">
                {cartItems.map((item) => (
                  <li key={item.product_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        {item.image_urls && item.image_urls.length > 0 ? (
                          <Image src={item.image_urls[0]} alt={item.product_name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                        <div className="flex items-center space-x-2 text-sm mt-1">
                          <Button size="icon" onClick={() => handleDecreaseQuantity(item.product_id)} disabled={item.quantity <= 1}>-</Button>
                          <span>{item.quantity}</span>
                          <Button size="icon" onClick={() => handleIncreaseQuantity(item.product_id)}>+</Button>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveFromCart(item.product_id)}>Remove</Button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleCheckout}>
                  Checkout ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </Button>
              </div>
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    )
  }
}