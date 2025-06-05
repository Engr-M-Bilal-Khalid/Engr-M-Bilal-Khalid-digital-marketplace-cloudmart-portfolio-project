import AdminProductView from "./(productViews)/adminProductView";
import OwnerProductView from "./(productViews)/ownerProductView";
import SellerProductView from "./(productViews)/sellerProductView";

interface ProductsContentProps {
  userRole: string | undefined;
  userId: number | undefined;
}

export interface ProductViewProps {
    userRole: string,
    userId: number
}

const ProductsContent = ({ userRole, userId }: ProductsContentProps) => {
  switch (userRole) {
    case 'seller':
      return <SellerProductView userId={userId as number} userRole={userRole as string}/>
    case 'admin':
      return <AdminProductView userId={userId as number} userRole={userRole as string}/>
    case 'owner':
      return <OwnerProductView userId={userId as number} userRole={userRole as string}/>
    default:
      return <h1>Invalid!</h1>
  }  
};

export default ProductsContent;



