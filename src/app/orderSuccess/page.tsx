'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { successNotifier } from '@/lib/designPatterns/observerPattern/notificationTrigger';

const Page: React.FC = () => {
  const searchParams = useSearchParams();
  const cartId = searchParams.get('cartId');
  const customerId = searchParams.get('customerId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const createOrder = async () => {
      if (!cartId || !customerId) return;

      try {
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cartId, customerId }),
        });

        if (response.status === 200) {
          const data = await response.json();
          setOrderId(data.orderId);
          setCartItems(data.cartItems);
        } else {
          setError('Failed to create order');
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [cartId, customerId]);

  if (!cartId && !customerId) return <div className="flex items-center justify-center min-h-screen">
    <div className="text-red-600 text-xl font-semibold text-center">
      Cart Id And CustomerId not found!
    </div>
  </div>
    ;

  if (loading) return <div className="text-center mt-10">Processing your order...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Order Successful!<br />
          Order ID: {orderId}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4 text-left text-gray-800 dark:text-gray-100">Download Your Assets</h2>
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 w-full md:w-3/4">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="text-left">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white">{item.product_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{item.description}</p>
                    <p className="text-sm text-blue-500">Seller: {item.email}</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">Price: ${item.price}</p>
                  </div>
                </div>
                <a
                  href={item.digital_asset_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                  onClick={() => { successNotifier.notify(`Product downloaded successfully! ${item.product_name}`) }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Link href={`/orders?cartId=${cartId}&customerId=${customerId}`}>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 hover:cursor">
              View Orders
            </button>
          </Link>
          <Link href="/" className="block mt-4 text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;



