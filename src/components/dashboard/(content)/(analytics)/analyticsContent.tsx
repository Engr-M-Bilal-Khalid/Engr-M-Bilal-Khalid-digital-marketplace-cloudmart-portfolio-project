"use client";

import { OwnerDashboard } from "./owner-analytics";
import { SellerDashboard } from "./seller-analytics";


interface AnalyticProps {
    userRole?: string,
    userId?: number
}

export const AnalyticsContent = ({ userId, userRole }: AnalyticProps) => (
    <>
        <h2 className="text-6xl font-extrabold transition-colors duration-500 text-[#333333]">Analytics</h2>
        <p className="mt-2 text-lg transition-colors duration-500 text-[#333333]">View Analytics</p> 
        {
            userRole === 'seller' ?
                <SellerDashboard userRole={userRole as string} userId={userId as number} />
                : <OwnerDashboard userRole={userRole as string} userId={userId as number} />
        }
    </>
);

