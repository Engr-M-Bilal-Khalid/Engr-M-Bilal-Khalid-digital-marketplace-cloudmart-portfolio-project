"use client"; // This is a Client Component

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import OrderItem from "@/components/OrderItems"; // Make sure this path is correct
import {
  errorNotifier,
  successNotifier,
} from "@/lib/designPatterns/observerPattern/notificationTrigger"; // Your notification system

// Define the type for an order product based on your API response
interface Product {
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  digital_asset_url: string | null; // Can be null if no digital asset
  description: string;
  image_url: string | null; // Can be null if no image
  email: string; // Seller's email
  userName: string; // Seller's username
  customer_id: string; // Assuming customer_id is a string (UUID or similar)
}

interface OrdersData {
  recentOrderProducts: Product[];
  allOrderProducts: Product[];
  message: string; // From API response
  status: number; // From API response
}

const OrdersPage = () => {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");
  const customerId = searchParams.get("customerId");

  const [recentOrders, setRecentOrders] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    // Only attempt to fetch if both cartId and customerId are available
    if (!cartId || !customerId) {
      setError("Missing cart ID or customer ID in URL parameters.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear previous errors

      // Using the API endpoint provided in the previous solution
      const response = await fetch("/api/fetch-all-orders-of-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId, customerId }),
      });

      const data: OrdersData = await response.json();

      if (!response.ok || data.status !== 200) {
        // If response is not ok or status is not 200 (even if response.ok is true for some server errors)
        const errorMessage = data.message || "Failed to fetch orders.";
        errorNotifier.notify(errorMessage);
        setError(errorMessage);
        setRecentOrders([]); // Clear orders on error
        setAllOrders([]);
      } else {
        successNotifier.notify(data.message);
        setRecentOrders(data.recentOrderProducts);
        setAllOrders(data.allOrderProducts);
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      const errorMessage =
        err.message || "An unexpected error occurred while fetching orders.";
      errorNotifier.notify(errorMessage);
      setError(errorMessage);
      setRecentOrders([]); // Clear orders on error
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [cartId, customerId]); // Re-fetch when cartId or customerId from URL changes

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Your Orders
      </h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-600">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Your Recent Orders Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
              Your Recent Orders
            </h2>
            {recentOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {recentOrders.map((order) => (
                  // Using product_id as key, assuming it's unique enough for sibling elements.
                  // For better practice, if your order items don't have truly unique product_id within a specific cart context,
                  // you might need a composite key or add an index to the map callback.
                  <OrderItem key={order.product_id} {...order} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-lg">
                No recent orders found for Cart ID: {cartId}.
              </p>
            )}
          </section>

          {/* All Orders Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
              All Orders
            </h2>
            {allOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {allOrders.map((order, index) => (
                  // Using product_id as key. If products can repeat in All Orders and cause key issues,
                  // consider using a combination of product_id and index, or a unique order_item_id from your DB.
                  <OrderItem key={`${order.product_id}-${index}`} {...order} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-lg">
                No past orders found for Customer ID: {customerId}.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default OrdersPage;