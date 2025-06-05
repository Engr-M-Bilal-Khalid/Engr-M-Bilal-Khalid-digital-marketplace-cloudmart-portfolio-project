"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getMonthlyAnalytics, Order } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AnalyticsChart } from "./analytics-chart";


interface SellerProps {
    userRole: string,
    userId: number
}


export function SellerDashboard({ userId, userRole }: SellerProps) {

    const [orderAnalytics, setOrderAnalytics] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchAnalyticDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/fetch-analytic-details', {
                method: 'POST',
                body: JSON.stringify({ userId, userRole })
            });
            if (response.status === 200) {
                const data = await response.json();
                const analytics = data.orderDetail;
                console.log(analytics);
                setOrderAnalytics(Array.isArray(analytics) ? analytics : []);
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAnalyticDetails();
    }, []);

    const orders: Order[] = orderAnalytics;
    const monthlyData = getMonthlyAnalytics(orders);
    const totalSale = monthlyData.reduce((sum, m) => sum + m.totalSale, 0);
    const totalFee = monthlyData.reduce((sum, m) => sum + m.totalPlatformFee, 0);
    const totalProf = monthlyData.reduce((sum, m) => sum + m.totalProfit, 0);

    if (loading) {
        return (
            <>
                <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                    <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                </div>
            </>
        )
    } else {
        return (
            <div className="p-4 space-y-6">
                <Card>
                    <CardContent className="flex justify-between p-6 text-lg font-semibold">
                        <span>Total Sales: ${totalSale.toFixed(2)}</span>
                        <span>Your Earnings: ${totalProf.toFixed(2)}</span>
                        <span>Platform Fee: ${totalFee.toFixed(2)}</span>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-xl font-bold mb-2">Monthly Sales Analytics</h2>
                    <AnalyticsChart data={monthlyData} role="seller" />
                </div>
            </div>
        );
    }


}