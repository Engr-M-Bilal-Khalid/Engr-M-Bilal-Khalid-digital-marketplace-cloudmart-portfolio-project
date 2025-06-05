interface WelcomeContentProps {
  userId?: number;
  userRole?:string;
}

export const WelcomeContent = ({ userId, userRole }: WelcomeContentProps) => {
    
    return (
        <>

            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-700 text-slate-950 shadow-lg space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Welcome to CloudMart</h2>
                <p className="text-lg text-slate-600">
                    Hello <span className="font-medium capitalize">{userRole}</span>! 👋
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                    {
                        userRole === 'customer' ? 'As a Customer, you can browse and purchase high-quality digital products from trusted sellers in our marketplace.' :
                            userRole === 'seller' ? 'As a Seller, you can list and manage your digital products, track sales, and grow your business within the CloudMart ecosystem.' :
                                userRole === 'admin' ? 'As an Admin, you manage the CloudMart platform, users, and system settings. Your role is vital to ensuring a smooth and secure marketplace experience.' :
                                    userRole === 'owner' ? 'As the Owner, you have full access to all administrative functions and platform-level controls of CloudMart.' : null
                    }
                </p>
            </div>
        </>

    )
};