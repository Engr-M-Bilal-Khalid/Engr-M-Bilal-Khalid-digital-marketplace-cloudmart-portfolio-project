"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    BarChart,
    Settings,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { allMenuItems,MenuItem } from '@/components/dashboard/allMenuItems';


interface SidebarItem {
    label: string;
    icon: React.ComponentType;
}

const sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Users', icon: Users },
    { label: 'Analytics', icon: BarChart },
    { label: 'Settings', icon: Settings },
    // Add more items as needed
];



const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={cn(
                    'bg-gray-800 text-white transition-all duration-300',
                    isCollapsed ? 'w-20' : 'w-64',
                    'flex flex-col'
                )}
            >
                <div className="p-4 flex items-center justify-between">
                    {!isCollapsed && (
                        <span className="text-xl font-semibold">My Dashboard</span>
                    )}
                    <Button
                        variant="ghost"
                        onClick={toggleSidebar}
                        className="text-white hover:bg-gray-700"
                    >
                        {isCollapsed ? (
                            <Menu className="text-2xl" /> // Increased size
                        ) : (
                            <X className="text-2xl" />
                        )}
                    </Button>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <Link
                            href="#"
                            key={item.label}
                            className={cn(
                                'block py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-md',
                                'px-2'
                            )}
                        >
                            <div className="flex items-center ">
                                <span className="mr-2 text-xl"><item.icon/></span>
                                {!isCollapsed && <span>{item.label}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
