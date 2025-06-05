import { Activity, Box, Boxes, CircleUser, Crown, Package, Settings, ShoppingCart, Store, Truck, UserCircle2, UserPen, Users } from "lucide-react";
import { AnalyticsContent } from "./(content)/(analytics)/analyticsContent";
import { AdminContent } from "./(content)/(users)/adminContent";
import { OrdersContent } from "./(content)/orderContent";
import ProductsContent from "./(content)/(products)/productContent";
import { ProfileContent } from "./(content)/profileContent";
import { ProductCategoriesContent } from "./(content)/productCategories";
import { WelcomeContent } from "./(content)/welcomeContent";
import { SettingsContent } from "./(content)/(settings)/settingContent";


export interface MenuItem {
    label: string;
    icon: React.ReactNode;
    roles?: string[];
    content: (userRole?: string, userId?: number, setShowSignOutLoading?: (status: boolean) => void) => React.ReactNode;
}

export const allMenuItems: MenuItem[] = [
    {
        label: 'Welcome', icon: <UserCircle2 className="h-5 w-5  text-slate-900" />, roles: ['customer', 'seller', 'admin', 'owner'],
        content: (userRole, userId) => <WelcomeContent userId={userId} userRole={userRole} />,
    },
    {
        label: 'Users', icon: <Users className="mr-2 h-4 w-4 text-slate-900" />, roles: ['admin', 'owner'],
        content: () => <></>,
    },
    {
        label: 'Products',
        icon: <Package className="mr-2 h-4 w-4 text-slate-900" />,
        roles: ['admin', 'seller', 'owner'],
        content: (userRole, userId,) => <ProductsContent userRole={userRole} userId={userId} />,
    },
    {
        label: 'Product Categories', icon: <Boxes className="mr-2 h-4 w-4 text-slate-900" />, roles: ['admin'],
        content: (userRole, userId) => <ProductCategoriesContent userId={userId} userRole={userRole} />,
    },
    {
        label: 'Orders', icon: <Truck className="mr-2 h-4 w-4 text-slate-900" />, roles: ['customer', 'seller'],
        content: (userRole, userId) => <OrdersContent userRole={userRole} userId={userId} />,
    },
    {
        label: 'Analytics', icon: <Activity className="mr-2 h-4 w-4 text-slate-900" />, roles: ['owner', 'seller'],
        content: (userRole, userId) => <AnalyticsContent userRole={userRole} userId={userId} />,
    },
    {
        label: 'Settings', icon: <Settings className="mr-2 h-4 w-4 text-slate-900" />, roles: ['owner'],
        content: (userRole, userId) => <SettingsContent userRole={userRole} userId={userId}/>
    },

    {
        label: 'Profile', icon: <UserPen className="mr-2 h-4 w-4 text-slate-900" />, roles: ['customer', 'seller', 'admin', 'owner'],
        content: (userRole, userId, setShowSignOutLoading) => <ProfileContent userId={userId} userRole={userRole} setShowSignOutLoading={setShowSignOutLoading ?? (() => { })} />,
    },
];

export const dropDownMenuItemsForOwner: MenuItem[] = [
    {
        label: 'Admins',
        icon: <Crown className="mr-2 h-4 w-4 text-[#E5B936]" />,
        roles: ['owner'],
        content: () => <AdminContent role_id={2} />,
    }

]

export const dropDownMenuItemsForAdmin: MenuItem[] = [
    {
        label: 'Sellers', icon: <Store className="mr-2 h-4 w-4 text-[#E5B936]" />, roles: ['owner'],
        content: () => <AdminContent role_id={3} />,
    },
    {
        label: 'Customers', icon: <CircleUser className="mr-2 h-4 w-4 text-green-500" />, roles: ['owner'],
        content: () => <AdminContent role_id={4} />,
    },

]