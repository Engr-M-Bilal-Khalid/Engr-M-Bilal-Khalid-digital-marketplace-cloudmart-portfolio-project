import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Order = {
    order_date: string;
    price: number,
    seller_price: number;
    platform_price: number;
};

export type MonthlyAnalytics = {
    month: string;
    totalSale: number;
    totalProfit: number;
    totalPlatformFee: number;
};



export function getMonthlyAnalytics(orders: Order[]): MonthlyAnalytics[] {
    const monthlyMap = new Map<string, MonthlyAnalytics>();

    orders.forEach((order) => {
        const date = new Date(order.order_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
                month: monthKey,
                totalSale: 0,
                totalProfit: 0,
                totalPlatformFee: 0,
            });
        }

        const data = monthlyMap.get(monthKey)!;
        data.totalSale += order.price;
        data.totalProfit += order.seller_price; // Assuming profit equals sale
        data.totalPlatformFee += order.platform_price;
    });

    return Array.from(monthlyMap.values());
}
