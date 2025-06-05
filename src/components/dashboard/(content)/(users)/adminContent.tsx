"use client"
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { errorNotifier, successNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";
import { cn } from "@/lib/utils";
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Success } from "../../seller/productCreation";

interface AContentProps {
    role_id: number
}

interface Accounts {
    created_at: string,
    email: string,
    emailVerified: boolean,
    login_count: number,
    userName: string,
    user_id: number
}

export interface VerfyDropDownI {
    onVerify: () => void;
}

export function VerifyDropdown({ onVerify}: VerfyDropDownI) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);


    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1"
            >
                {
                    open ? <ChevronUp className="w-4 h-4 text-green-500 relative top-1 left-1" /> : <ChevronDown className="w-4 h-4 text-green-500 relative top-1 left-1" />
                }
            </button>

            {open && (
                <Button className="absolute z-10 top-full right-0 mt-2 bg-gray-500 hover:bg-gray-600 text-white transition-all w-auto py-1 px-7 rounded text-center "
                    onClick={() => {
                        setOpen(false);
                        onVerify();
                    }}
                >
                    Verify
                </Button>
            )}
        </div>
    );
}


export const AdminContent = ({ role_id }: AContentProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [adminAccounts, setAdminAccounts] = useState<Accounts[]>([]);
    const [sellerAccounts, setSellerAccounts] = useState<Accounts[]>([]);
    const [customerAccounts, setCustomerAccounts] = useState<Accounts[]>([]);
    const [adminAdd, setAdminAdd] = useState(false)
    const fetchAdminAccounts = async () => {
        setLoading(true);
        const response = await fetch('/api/fetch-users-for-owner', {
            method: 'POST',
            body: JSON.stringify({ roleId: role_id })
        });
        if (response.status === 200) {
            const data = await response.json();
            if (role_id === 2) {
                const adminAccount = data.result;
                setAdminAccounts(adminAccount);
                setLoading(false);
                return;
            } else if (role_id === 3) {
                const sellerAccount = data.result;
                setSellerAccounts(sellerAccount);
                setLoading(false);
                return;
            } else if (role_id === 4) {
                const customerAccount = data.result;
                setCustomerAccounts(customerAccount);
                setLoading(false);
                return;
            } else {
                alert('Invalid!');
                setError(true);
                return;
            }
        }
    };
    const handleAccountVerification = async (user_id_of_unVerify_account: number,userRole?:string) => {
        const response = await fetch('/api/verify-accounts', {
            method: 'POST',
            body: JSON.stringify({ userId: user_id_of_unVerify_account,userRole})
        });
        const data = await response.json();
        if (data.status === 200 || data.status === 201) {
            successNotifier.notify(data.message);
            fetchAdminAccounts();
        }else{
            errorNotifier.notify(data.message);
        }
    }
    useEffect(() => {
        fetchAdminAccounts()
    }, [role_id]);
    if (role_id === 2) {
        return (
            <>
                <div className="flex items-center justify-between">
                    <h2 className="text-6xl font-extrabold transition-colors duration-500 text-[#333333]">Admins</h2>
                    <>
                        <Dialog>
                            <DialogTrigger className="flex bg-black  text-white  py-2 px-4 rounded-md transition-colors duration-300" onClick={() => setAdminAdd(false)}>
                                <Plus className="h-4 w-4 mt-1 mr-1" />
                                Add New Admin
                            </DialogTrigger>
                            <DialogContent style={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                            }} onInteractOutside={(event) => event.preventDefault()}>
                                <DialogTitle className="pl-6">
                                    Add New Admin
                                </DialogTitle>
                                {adminAdd ? (
                                    <>
                                        <Success
                                            message="Admin Add Successfully!"
                                            description="New admin added successfully. You can add another admin if you want."
                                            actionText="Add Another Admin"
                                            onAction={() => setAdminAdd(false)}
                                        />
                                    </>
                                ) : (
                                    <AddNewAdmin fetchAdminAccounts={fetchAdminAccounts} onAdminAdd={() => setAdminAdd(true)} />
                                )}
                            </DialogContent>
                        </Dialog>
                    </>
                </div>
                <p className="mt-2 text-lg transition-colors duration-500 text-[#333333]">Manage Admins Accounts</p>
                <div className={cn(adminAccounts.length === 0 ? "mt-3 text-red-600 font-bold" : "overflow-auto rounded-xl shadow-md border border-gray-200  mt-5")}>
                    {
                        loading ?
                            <>
                                <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                                    <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                                </div>
                            </> :
                            adminAccounts.length !== 0 ?
                                <Table className="text-sm text-[#333333] bg-white [&_th]:text-center [&_td]:text-center [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-2">
                                    <TableCaption className="text-[#333333] text-base pb-3">

                                        {
                                            adminAccounts.length === 0 ? 'No admin found!' : 'A list of admin accounts'
                                        }
                                    </TableCaption>
                                    <TableHeader className="bg-gray-100">
                                        <TableRow>
                                            <TableHead className="w-[100px]">S.No</TableHead>
                                            <TableHead>User Id</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead>Email Status</TableHead>
                                            <TableHead className="text-right">Login Count</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-white hover:bg-amber-100 transition">
                                        {
                                            adminAccounts.length === 0
                                                ?
                                                null
                                                :
                                                adminAccounts.map((value, index) => (
                                                    <TableRow key={value.user_id} className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}>
                                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                                        <TableCell>{value.user_id}</TableCell>
                                                        <TableCell>{value.userName}</TableCell>
                                                        <TableCell>{value.email}</TableCell>
                                                        <TableCell>{value.created_at ? new Date(value.created_at).toLocaleString() : "N/A"}</TableCell>
                                                        <TableCell>
                                                            {value.emailVerified ? (
                                                                <span className="text-sm text-green-700 font-medium">Verified</span>
                                                            ) : (
                                                                <>
                                                                    <span className="text-sm text-red-500 font-medium">Not Verified</span>
                                                                    <VerifyDropdown onVerify={() => handleAccountVerification(value.user_id)} />
                                                                </>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">{value.login_count}</TableCell>
                                                    </TableRow>
                                                ))
                                        }
                                    </TableBody>
                                    <TableFooter>
                                    </TableFooter>
                                </Table> : <h1>No admin account found!</h1>
                    }
                </div>
            </>
        )
    }
    if (role_id === 3) {
        return (
            <>
                <h2 className="text-6xl font-extrabold transition-colors duration-500 text-[#333333]">Seller</h2>
                <p className="mt-2 text-lg transition-colors duration-500 text-[#333333]">Manage Sellers Accounts</p>
                <div className="overflow-auto rounded-xl shadow-md border border-gray-200  mt-5">
                    {
                        loading ?
                            <>
                                <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                                    <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                                </div>
                            </> :
                            <Table className="text-sm text-[#333333] bg-white [&_th]:text-center [&_td]:text-center [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-2">
                                <TableCaption className="text-[#333333] text-base pb-3">

                                    {
                                        sellerAccounts.length === 0 ? 'No seller found!' : 'A list of seller accounts'
                                    }
                                </TableCaption>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="w-[100px]">S.No</TableHead>
                                        <TableHead>User Id</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Login Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white hover:bg-amber-100 transition">
                                    {
                                        sellerAccounts.length === 0
                                            ?
                                            null
                                            :
                                            sellerAccounts.map((value, index) => (
                                                <TableRow key={value.user_id} className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>{value.user_id}</TableCell>
                                                    <TableCell>{value.userName}</TableCell>
                                                    <TableCell>{value.email}</TableCell>
                                                    <TableCell>{value.created_at ? new Date(value.created_at).toLocaleString() : "N/A"}</TableCell>
                                                    <TableCell>
                                                        {value.emailVerified ? (
                                                            <span className="text-sm text-green-700 font-medium">Verified</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm text-red-500 font-medium">Not Verified</span>
                                                                <VerifyDropdown onVerify={() => handleAccountVerification(value.user_id,"seller")} />
                                                            </>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-right">{value.login_count}</TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                                <TableFooter>
                                </TableFooter>
                            </Table>
                    }
                </div>
            </>
        )
    }
    if (role_id === 4) {
        return (
            <>
                <h2 className="text-6xl font-extrabold transition-colors duration-500 text-[#333333]">Customers</h2>
                <p className="mt-2 text-lg transition-colors duration-500 text-[#333333]">Manage Customers Accounts</p>
                <div className="overflow-auto rounded-xl shadow-md border border-gray-200  mt-5">
                    {
                        loading ?
                            <>
                                <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                                    <div className="mt-2 rounded-md h-10 w-10 border-4 border-t-4 border-[#333333] animate-spin"></div>
                                </div>
                            </> :
                            <Table className="text-sm text-[#333333] bg-white [&_th]:text-center [&_td]:text-center [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-2">
                                <TableCaption className="text-[#333333] text-base pb-3">

                                    {
                                        customerAccounts.length === 0 ? 'No customer found!' : 'A list of customer accounts'
                                    }
                                </TableCaption>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="w-[100px]">S.No</TableHead>
                                        <TableHead>User Id</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Login Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white hover:bg-amber-100 transition">
                                    {
                                        customerAccounts.length === 0
                                            ?
                                            null
                                            :
                                            customerAccounts.map((value, index) => (
                                                <TableRow key={value.user_id} className={index % 2 === 0 ? "bg-white hover:bg-amber-100 transition" : "bg-gray-50 hover:bg-[#58B19F]/30 transition"}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>{value.user_id}</TableCell>
                                                    <TableCell>{value.userName}</TableCell>
                                                    <TableCell>{value.email}</TableCell>
                                                    <TableCell>{value.created_at ? new Date(value.created_at).toLocaleString() : "N/A"}</TableCell>
                                                    <TableCell>
                                                        {value.emailVerified ? (
                                                            <span className="text-sm text-green-700 font-medium">Verified</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm text-red-500 font-medium">Not Verified</span>
                                                                <VerifyDropdown onVerify={() => handleAccountVerification(value.user_id)} />
                                                            </>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">{value.login_count}</TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                                <TableFooter>
                                </TableFooter>
                            </Table>
                    }
                </div>
            </>
        )
    }
};

const signUpSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, { // Minimum length of 8
        message: 'Password must be exactly 8 characters.',
    }).max(8, {  //Maximum length of 8
        message: 'Password must be exactly 8 characters'
    }).regex(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/), {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
    confirmPassword: z.string(),
    role: z.enum(['admin'], {
        required_error: "Please select a role",
    }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
})

interface AddNewAdminProps {
    fetchAdminAccounts: () => void;
    onAdminAdd: () => void;
}


const AddNewAdmin = ({ fetchAdminAccounts ,onAdminAdd}: AddNewAdminProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signUpError, setSignUpError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [role, setRole] = useState<string | undefined>('customer'); // Default role
    // Initialize the form using react-hook-form
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'admin',
        },
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    // Function to handle form submission
    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        setSignUpError(null); // Reset error state

        try {
            // Send data to your backend API endpoint
            const response = await fetch('/api/sign-up', { // Updated route path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to sign up.');
            }

            // If sign-up is successful
            console.log('Sign Up Data:', values);
            successNotifier.notify("Account has been created successfully");
            form.reset();
            onAdminAdd();
            fetchAdminAccounts();
        } catch (error: any) {
            console.error('Sign Up Error:', error);
            errorNotifier.notify(error)
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update local state when the role changes, so we can show/hide fields.
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'role') {
                setRole(value.role);
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    return (
        <div className="flex items-center justify-center p-6">
            <div className="w-full max-w-md  ">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your name"
                                            {...field}
                                            className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email"
                                            {...field}
                                            type="email"
                                            className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input
                                                placeholder="Enter your password"
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                                                title={showPassword ? 'Hide confirm password' : 'Show confirm password'}
                                            >
                                                {showPassword ? (
                                                    <Eye className="h-5 w-5" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5" />
                                                )}
                                            </button>

                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input
                                                placeholder="Confirm your password"
                                                {...field}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleConfirmPasswordVisibility}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                                                title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                            >
                                                {showConfirmPassword ? (
                                                    <Eye className="h-5 w-5" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-red-400" />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full py-2 px-4 rounded-md transition-colors duration-300"
                            variant="default"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Admin'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};





