'use client';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';

import {
  ChevronDown,
  ChevronUp,
  Home,
  LogOut
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { allMenuItems, dropDownMenuItemsForAdmin, dropDownMenuItemsForOwner, MenuItem } from './allMenuItems';
import { handleSignOut } from './handleSignOut';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from '../ui/separator';
import '@/app/globals.css'
import Link from 'next/link';


interface SidebarMenuOwnerI {
  roleName: string,
  handleMenuItemClick: (content: React.ReactNode, item: string) => void,
  userId: number,
  menuItems: MenuItem[]
}

const SidebarMenuOwner = ({ roleName, handleMenuItemClick, userId, menuItems }: SidebarMenuOwnerI) => {
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  return (
    <>
      {menuItems.slice(1).map((item, index) => (
        <React.Fragment key={item.label}>

          {item.label === 'Users' ? (
            <>
              <SidebarMenuItem>
                <Button
                  variant="link"
                  className="w-auto text-slate-900  font-bold text-sm"
                  onClick={() => setIsUsersOpen(!isUsersOpen)}
                >
                  <div className="mr-2 h-4 w-4">{item.icon}</div>
                  {item.label}
                  <span className="ml-auto">{isUsersOpen ? <ChevronUp /> : <ChevronDown className='w-4 h-4 text-green-300' />}</span>
                </Button>
                <Separator />
              </SidebarMenuItem>

              {/* Dropdown shown if isUsersOpen is true */}
              {isUsersOpen && (
                <SidebarMenuItem>
                  <div className="ml-6 mt-1 space-y-1">
                    {
                      roleName === 'owner'
                        ?
                        dropDownMenuItemsForOwner.map((subItem) => (
                          <Button
                            key={subItem.label}
                            variant="link"
                            className="w-auto text-slate-900  font-bold text-sm"
                            onClick={() => handleMenuItemClick(subItem.content(roleName, userId), subItem.label)}
                          >
                            <div className="mr-2 h-4 w-4">{subItem.icon}</div>
                            {subItem.label}
                          </Button>
                        ))
                        :
                        dropDownMenuItemsForAdmin.map((subItem) => (
                          <Button
                            key={subItem.label}
                            variant="link"
                            className="w-full font-bold text-slate-900 justify-start  text-sm"
                            onClick={() => handleMenuItemClick(subItem.content(roleName, userId), subItem.label)}
                          >
                            <div className="mr-2 h-4 w-4">{subItem.icon}</div>
                            {subItem.label}
                          </Button>
                        ))
                    }
                  </div>
                </SidebarMenuItem>
              )}
            </>
          ) : (
            <SidebarMenuItem>
              <Button
                variant="link"
                className="w-auto text-slate-900  font-bold text-sm"
                onClick={() =>
                  handleMenuItemClick(item.content(roleName, userId), item.label)
                }
              >
                <div className="mr-2 h-4 w-4">{item.icon}</div>
                {item.label}
              </Button>
            </SidebarMenuItem>
          )}
        </React.Fragment>
      ))}
    </>
  );
};



const dashboardPropsSchema = z.object({
  roleName: z.string(),
  userId: z.number().int(),
  userName: z.string(),
  stripeAccountId: z.union([z.string(), z.null(), z.undefined()]),
});

type DashboardProps = z.infer<typeof dashboardPropsSchema>;

const Dashboard: React.FC<DashboardProps> = ({ roleName, userId, userName, stripeAccountId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on larger screen
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeContent, setActiveContent] = useState<React.ReactNode>(
    allMenuItems[0].content(roleName, userId)
  );
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [connectToStripeLoad, setConnectToStripeLoad,] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string>("Profile");
  const [showSignOutLoading, setShowSignOutLoading] = useState<boolean>(false);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  useEffect(() => {
    const filteredItems = allMenuItems.filter(
      (item) => !item.roles || item.roles.includes(roleName)
    );
    setMenuItems(filteredItems);
    if (filteredItems.length > 0) {
      setActiveContent(filteredItems[0].content(roleName, userId));
    }
  }, [roleName, userId]);



  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleMenuItemClick = (content: React.ReactNode, item: string) => {
    setBreadcrumb(item)
    setActiveContent(content);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const connectToStripe = async (userId: number) => {
    setConnectToStripeLoad(true);
    try {
      const res = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error('Stripe connection failed:', err);
      setConnectToStripeLoad(false);
    }
  };


  const handleGoToStripe = async (accountId: string) => {
    if (!accountId) {
      setError("Account ID is missing.  Please ensure the seller's account has been created.");
      return;
    }

    setLoading(true);
    setError(null);


    try {
      const response = await fetch('/api/stripe-dashboard-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate Stripe dashboard link');
      }

      const data = await response.json();
      if (data && data.url) {
        console.log(data.url)
        window.open(data.url, '_blank');
      } else {
        throw new Error('Invalid response from server: URL missing');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the link.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {
        showSignOutLoading ?
          <>
            <div className="flex flex-col items-center justify-center h-[500px] space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-t-4 border-gray-300 border-t-blue-500 animate-spin"></div>
              <p className="text-lg font-semibold text-gray-800">
                🎉 Ownership transferred successfully!
              </p>
              <p className="text-sm text-gray-600">
                You are no longer the owner of this platform <span className="text-blue-500">Cloudmart</span>. Signing you out...
              </p>
              <p className="text-xs text-gray-400">
                Just a moment while we end your session securely.
              </p>
            </div>
          </>

          :
          userName ?
            <>
              <Sidebar className="flex h-screen overflow-hidden transition-colors duration-500 border-r  backdrop-blur-sm  bg-[#F3F4F6]! z-10" >
                <SidebarHeader className='bg-blue-300 pt-[15px] pr-6 pl-6 text-center'>
                  {
                    userName ?
                      <>
                        <div className="flex items-center ">
                          <h1 className="text-4xl text-center font-extrabold  text-slate-800  ">
                            Cloud Mart
                          </h1>
                        </div>

                      </>
                      : null
                  }

                </SidebarHeader>


                <SidebarContent className="flex flex-col h-full bg-[#F3F4F6]! overflow-hidden">

                  <SidebarMenu className="flex-1 space-y-3 mt-6 ml-3 tracking-wide ">
                    {
                      userName
                        ? roleName === 'seller' && stripeAccountId != 'placeholder'
                          ? menuItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                              <Button
                                variant="link"
                                className="w-auto text-slate-900  font-bold text-sm hover:text-gray-700"
                                onClick={() =>
                                  handleMenuItemClick(
                                    item.label === "Profile"
                                      ? item.content(roleName, userId, setShowSignOutLoading) // send extra arg
                                      : item.content(roleName, userId),
                                    item.label
                                  )
                                }
                              >
                                <div className="mr-2">{item.icon}</div>
                                {item.label}
                              </Button>
                              <Separator />
                            </SidebarMenuItem>
                          ))
                          : menuItems.length > 0 && (
                            <>
                              <SidebarMenuItem key={menuItems[0].label}>
                                <Button
                                  variant="link"
                                  className="w-auto text-slate-900 font-bold text-sm"
                                  onClick={() => handleMenuItemClick(menuItems[0].content(roleName, userId), menuItems[0].label)}
                                >
                                  <div className="mr-2">{menuItems[0].icon}</div>
                                  {menuItems[0].label}
                                </Button>
                                <Separator />
                              </SidebarMenuItem>
                              {roleName === 'seller' ? (
                                <h1 className="text-center text-slate-600 dark:text-gray-100 ml-1 mr-1">
                                  In order to fully mange dashboard connect your stripe account
                                </h1>
                              ) : null}
                            </>
                          )
                        : null
                    }

                    {userName && roleName === 'customer' && (
                      menuItems.slice(1).map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <Button
                            variant="link"
                            className="w-auto text-slate-900  font-bold text-sm"
                            onClick={() => handleMenuItemClick(item.content(roleName, userId), item.label)}
                          >
                            <div className="mr-2">{item.icon}</div>
                            {item.label}
                          </Button>
                          <Separator />
                        </SidebarMenuItem>
                      ))
                    )}


                    {
                      userName && (roleName === 'owner' || roleName === 'admin') && (
                        <SidebarMenuOwner handleMenuItemClick={handleMenuItemClick} roleName={roleName} userId={userId} menuItems={menuItems} />
                      )
                    }

                  </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className='bg-[#F3F4F6]!'>
                  <div className="mb-5 space-y-2">


                    {
                      userName ? roleName === 'seller' ? stripeAccountId != 'placeholder' ? <Button
                        variant="default"
                        className="w-full justify-start rounded-xl bg-gradient-to-br from-blue-900 to-slate-800  text-white font-semibold transition-colors"
                        onClick={() => handleGoToStripe(stripeAccountId as string)} // Call the async function
                        disabled={loading || !stripeAccountId} // Disable when loading or accountId is missing
                      >
                        {loading ? (
                          <>Loading...</>
                        ) : (
                          <>
                            Go to Stripe Dashboard
                          </>
                        )}
                      </Button> : (
                        <Button
                          variant="default"
                          className="w-full justify-start rounded-xl bg-gradient-to-br from-purple-400 to-slate-800 text-white transition"
                          disabled={connectToStripeLoad}
                          onClick={() => connectToStripe(userId)}

                        >
                          {connectToStripeLoad ? `Connecting...` : `Connect with Stripe`}
                        </Button>
                      ) : null : null
                    }

                    {
                      userName ? <Button className="w-full justify-start rounded-xl bg-gradient-to-br from-red-400 to-red-800 text-white" onClick={handleSignOut}>
                        <LogOut className={cn('mr-2 h-4 w-4')} />
                        Sign Out
                      </Button> : null
                    }

                    <Button className="w-full justify-start rounded-xl bg-gradient-to-br from-blue-400 to-blue-800 text-white">
                      <Home className={cn('mr-2 h-4 w-4')}/>
                      <Link href="/" target='_blank'>Go to Home</Link>
                    </Button>

                  </div>
                </SidebarFooter>
              </Sidebar>
              <SidebarInset className='flex-1 bg-[#F3F4F6]'>
                <header className="fixed w-full flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-blue-300">
                  <SidebarTrigger className="-ml-1 bg-blue-400 hover:bg-blue-400 hover:cursor-pointer" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#" className='text-gray-800'>
                          Dashboard
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className='text-gray-800'>{breadcrumb}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </header>
                <div className="flex-1 overflow-hidden p-6 ">

                  <div ref={contentAreaRef} className="transition-all duration-300 bg-[#F3F4F6] pt-12">
                    {
                      userName ?
                        activeContent :
                        <div className="flex justify-center items-center h-screen">
                          <div className="rounded-md h-12 w-12 border-4 border-t-4 border-blue-500 animate-spin flex justify-center ">
                          </div>
                        </div>
                    }
                  </div>
                </div>
              </SidebarInset>
            </>
            : null
      }

    </>
  );
};

export default Dashboard;