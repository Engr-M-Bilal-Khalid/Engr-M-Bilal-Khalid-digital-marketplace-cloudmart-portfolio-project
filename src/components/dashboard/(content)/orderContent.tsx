import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { successNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";
import { Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface OrdersContentProps {
    userRole?: string,
    userId?: number
}


interface Order {
    order_id: number,
    customer_id: number,
    userName: string,
    email: string,
    order_date: string,
    order_status: string,
    payment_method: string,
    quantity: number,
    product_name: string,
    price: number,
    seller_price: number,
    platform_price: number
}

interface OrderCustomer {
    order_item_id: string
    product_name: string,
    description: string,
    price: number,
    digital_asset_url: string,
    payment_method: string,
    quantity: number,
    email: string,
    userName: string,
    category_name: string,
    order_date: string,
    order_status: string,
    created_at: string
}

export const OrdersContent = ({ userRole, userId }: OrdersContentProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersCustomer, setOrdersCustomer] = useState<OrderCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // useEffect(() => {
    //     console.log("Order");
    //     const fetchOrders = async () => {
    //         setIsLoading(true)
    //         const response = await fetch('/api/display-orders', {
    //             method: 'POST',
    //             body: JSON.stringify({ userId, userRole })
    //         });
    //         if (response.status === 200) {
    //             const data = await response.json();
    //             const status = data.status;
    //             const sellerId = data.sellerId
    //             alert(`${sellerId} , ${status}`)
    //             console.log(data.orderDetail);
    //             setOrders(data.orderDetail);
    //              setIsLoading(false)
    //         };
    //     };
    //     fetchOrders();
    // }, []);

    const totalSale = useMemo(() => {
        return orders.reduce((sum, order) => sum + (order.seller_price || 0), 0);
    }, [orders]);

    useEffect(() => {
        console.log("Fetching orders...");
        const fetchOrders = async () => {
            setIsLoading(true); // Set loading to true when fetch starts
            setError(null); // Clear any previous errors

            try {
                const response = await fetch('/api/display-orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Crucial for sending JSON in body
                    },
                    body: JSON.stringify({ userId, userRole })
                });

                if (!response.ok) { // Check if the response was successful (status code 2xx)
                    const errorData = await response.json(); // Try to parse error message from response
                    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // It's good practice to log the received data for debugging
                console.log("API Response Data:", data);

                // Ensure data.orderDetail is an array before setting state
                if (data.status === 200) {
                    if (Array.isArray(data.orderDetail)) {
                        setOrders(data.orderDetail);
                    } else {
                        console.warn("API response 'orderDetail' is not an array:", data.orderDetail);
                        setOrders([]); // Default to an empty array if not an array
                        setError("Received invalid data format from server.");
                    }
                } else if (data.status === 201) {
                    console.log(data.customerId);
                    if (Array.isArray(data.orderDetailCustomer)) {
                        setOrdersCustomer(data.orderDetailCustomer);
                    }
                }

            } catch (err) {
                console.error("Error fetching orders:", err);
                setError((err instanceof Error) ? err.message : "An unknown error occurred.");
                setOrders([]); // Ensure orders is empty on error
            } finally {
                setIsLoading(false); // Set loading to false when fetch completes (success or error)
            }
        };

        fetchOrders();
    }, [userId, userRole]);
    return (
        // <>
        //     <h2 className="text-6xl font-extrabold transition-colors duration-500 text-[#333333]">Orders</h2>
        //     <p className="mt-2 text-lg transition-colors duration-500">List of Orders</p>
        //     {
        //         orders === undefined ? <h1>Load</h1> : <Table className="overflow-x-auto">

        //             <TableHeader>
        //                 <TableRow>
        //                     <TableHead>Customer Name</TableHead>
        //                     <TableHead>Customer Email</TableHead>
        //                     <TableHead>Product Name</TableHead>
        //                     <TableHead>Product Price</TableHead>
        //                     <TableHead>Sale</TableHead>
        //                     <TableHead>Platform Fee</TableHead>
        //                     <TableHead>Payment Method</TableHead>
        //                     <TableHead>Quantity</TableHead>
        //                 </TableRow>
        //             </TableHeader>
        //             <TableBody>

        //                 {
        //                     orders.slice().reverse().map((order, index) => (
        //                         <TableRow
        //                             key={order.order_id}
        //                             className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}
        //                         >
        //                             <TableCell>{order.userName}</TableCell>
        //                             <TableCell>{order.email}</TableCell>
        //                             <TableCell>{order.product_name}</TableCell>
        //                             <TableCell>{order.price}</TableCell>
        //                             <TableCell>{order.seller_price}</TableCell>
        //                             <TableCell>{order.platform_price}</TableCell>
        //                             <TableCell>{order.paymentMethod}</TableCell>
        //                             <TableCell>{order.quantity}</TableCell>
        //                         </TableRow>
        //                     ))
        //                 }

        //             </TableBody>
        //         </Table>
        //     }
        // </>
        <>
            <h2 className="text-6xl font-extrabold transition-colors duration-500 text-[#333333]">Orders</h2>
            <p className="mt-2 text-lg transition-colors duration-500">List of Orders</p>


            {isLoading ? (
                <>
                    <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                        <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                    </div>
                </>
            ) : error ? (
                // Show error message if an error occurred
                <div className="text-red-500 p-4 border border-red-500 rounded mt-4">
                    <p>Error: {error}</p>
                    <p>Please try again later.</p>
                </div>
            ) : orders.length === 0 && ordersCustomer.length === 0 ? (
                // Show message if no orders are found after loading
                <p className="mt-4">No orders to display.</p>
            ) : (
                // Render the table if orders are available

                <div className="overflow-auto rounded-xl shadow-md border border-gray-200  mt-2">


                    <Table className="text-sm text-[#333333] bg-[#F3F4F6] [&_th]:text-center [&_td]:text-center [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-2">
                        <TableHeader>
                            <TableRow>
                                {
                                    userRole === 'seller' ?
                                        <>
                                            <TableHead>Customer Name</TableHead>
                                            <TableHead>Customer Email</TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Product Price</TableHead>
                                            <TableHead>Sale</TableHead>
                                            <TableHead>Platform Fee</TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Order Date</TableHead>
                                            <TableHead>Order Status</TableHead>
                                        </> : null
                                }
                                {
                                    userRole === 'customer' ?
                                        <>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Product Price</TableHead>
                                            <TableHead>Product Description</TableHead>
                                            <TableHead>Product Category</TableHead>
                                            <TableHead>Digital Asset</TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Order Date</TableHead>
                                            <TableHead>Order Status</TableHead>
                                            <TableHead>Seller Email</TableHead>
                                            <TableHead>Seller Name</TableHead>
                                        </>
                                        : null
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                userRole === 'seller' ?
                                    orders.slice().reverse().map((order, index) => (
                                        <TableRow
                                            key={order.order_id}
                                            className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}
                                        >
                                            <TableCell>{order.userName}</TableCell>
                                            <TableCell>{order.email}</TableCell>
                                            <TableCell>{order.product_name}</TableCell>
                                            <TableCell>{order.price}</TableCell>
                                            <TableCell>{order.seller_price}</TableCell>
                                            <TableCell>{order.platform_price}</TableCell>
                                            <TableCell>{order.payment_method}</TableCell>
                                            <TableCell>{order.quantity}</TableCell>
                                            <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                                            <TableCell>{order.order_status}</TableCell>
                                        </TableRow>
                                    )) : null
                            }
                            {
                                userRole === 'customer' ?
                                    ordersCustomer.slice().reverse().map((order, index) => (
                                        <TableRow
                                            key={order.order_item_id}
                                            className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}>
                                            <TableCell>{order.product_name}</TableCell>
                                            <TableCell>{order.price}</TableCell>
                                            <TableCell>{order.description}</TableCell>
                                            <TableCell>{order.category_name}</TableCell>
                                            {/* <TableCell>{order.digital_asset_url}</TableCell> */}
                                            <TableCell>
                                                <Link
                                                    href={order.digital_asset_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    onClick={() => { successNotifier.notify(`Product downloaded successfully!`) }}
                                                >
                                                    <Download className="w-4 h-4 text-center text-blue-500 ml-4" />

                                                </Link>
                                            </TableCell>
                                            {/* <Button
                                                asChild // This is crucial for Shadcn Button to render as an <a> tag
                                                variant="outline"
                                                size="icon"
                                                aria-label="Download Asset"
                                            >
                                                <Link
                                                    href={order.digital_asset_url}
                                                    download // This attribute prompts the browser to download the file
                                                    target="_blank" // Opens the download in a new tab/window (optional, but common)
                                                    rel="noopener noreferrer" // Security best practice for target="_blank"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Link>
                                            </Button> */}
                                            <TableCell>{order.payment_method}</TableCell>
                                            <TableCell>{order.quantity}</TableCell>
                                            <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                                            <TableCell>{order.order_status}</TableCell>
                                            <TableCell>{order.email}</TableCell>
                                            <TableCell>{order.userName}</TableCell>

                                        </TableRow>))
                                    : null
                            }
                        </TableBody>
                    </Table>

                </div>

            )}

            {
                userRole === 'seller'
                    ?
                    isLoading
                        ?
                        <>
                            <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                                <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                            </div>
                        </> :
                        <p className="text-3xl font-extrabold transition-colors duration-500 text-[#333333] mt-5">
                            Your Earning : {' '}
                            <span className="text-green-600">${totalSale.toFixed(2)}</span>
                        </p> :
                    null
            }

        </>
    );
};



