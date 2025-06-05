"use client";

import { MonthlyAnalytics } from "@/lib/utils";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

export interface AnalyticsProps {
    data: MonthlyAnalytics[];
    role: "owner" | "seller";
}

export const AnalyticsChart = ({ data, role }: AnalyticsProps) => {
    // Seniority colors for owner
    const colors = role === "owner"
        ? {
            sale: "#1e3a8a", // Navy - Authority
            fee: "#9ca3af", // Gray - Neutral Platform
            profit: "#b91c1c", // Crimson - Command/Profit
        }
        : {
            sale: "#4ade80", // Green - Seller Growth
            fee: "#facc15", // Yellow - Platform
            profit: "#3b82f6", // Blue - Seller Profit
        };

    return (
        <div className="w-full h-[500px] bg-white shadow-xl rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="totalSale" fill={colors.sale} name="Sale" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="totalPlatformFee" fill={colors.fee} name="Platform Fee" radius={[8, 8, 0, 0]} />
                    <Line type="monotone" dataKey="totalProfit" stroke={colors.profit} strokeWidth={3} name="Profit" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};