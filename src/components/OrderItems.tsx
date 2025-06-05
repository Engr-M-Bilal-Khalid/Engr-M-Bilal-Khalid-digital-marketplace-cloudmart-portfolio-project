// components/OrderItem.tsx
import Image from "next/image";
import { Download } from "lucide-react"; // Assuming you have lucide-react for icons

interface OrderItemProps {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  image_url: string | null; // Changed from string | undefined to string | null
  email: string; // Seller's email
  digital_asset_url: string | null; // Changed from string | undefined to string | null
}


const OrderItem: React.FC<OrderItemProps> = ({
  product_id,
  product_name,
  description,
  price,
  image_url,
  email,
  digital_asset_url,
}) => {
  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-md mb-4 border border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0 w-24 h-24 relative overflow-hidden rounded-md bg-gray-100">
        {image_url ? (
          <Image
            src={image_url}
            alt={product_name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="ml-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">
          {product_name}
        </h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        <p className="text-blue-600 text-sm mt-2">
          Seller: <span className="font-medium">{email}</span>
        </p>
        <p className="text-green-600 text-base font-bold mt-1">
          Price: ${price.toFixed(2)}
        </p>
      </div>

      {/* Download Button */}
      {digital_asset_url && (
        <div className="ml-auto">
          <a
            href={digital_asset_url}
            download
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default OrderItem;