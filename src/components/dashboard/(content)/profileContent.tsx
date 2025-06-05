import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { errorNotifier, successNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowRightLeft, Briefcase, Calendar, Key, Mail, MailCheck, MailOpen, MailX, Pencil, PowerOff, ShieldAlert, Trash2, UserCheck, UserRound } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { handleSignOut } from "../handleSignOut";

interface ProfileContentProps {
    userId: number | undefined,
    userRole: string | undefined,
    setShowSignOutLoading: (status: boolean) => void;
}

const ProfileSchema = z.object({
    userId: z.number(),
    userName: z.string(),
    email: z.string(),
    password: z.string(),
    lastLoginAt: z.date(),
    failedLoginAttempt: z.number(),
    loginCount: z.number(),
    emailVerified: z.boolean()
});

type Profile = z.infer<typeof ProfileSchema>;

const mockProfile = {
    userId: 0,
    userName: "",
    email: "",
    password: "",
    lastLoginAt: new Date,
    failedLoginAttempt: 0,
    loginCount: 0,
    emailVerified: false
}

export const ProfileContent = ({ userId, userRole, setShowSignOutLoading }: ProfileContentProps) => {

    const [profile, setProfile] = useState<Profile>(mockProfile);
    const [loading, setloading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenEmail, setIsOpenEmail] = useState(false);
    const [isOpenDeleteAccount, setIsOpenDeleteAccount] = useState(false);
    const [transferOwnerShip, setTransferOwnerShip] = useState(false);
    const [emailStatus, setEmailStatus] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState(false);


    const fetchprofileInfo = async () => {
        const response = await fetch('/api/fetch-profile-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, userRole })
        });
        if (!response) {
            console.log('Error aagya ha');
            return
        };
        const data = await response.json();
        console.log(data.result);

        setProfile(data.result);
        setloading(false)
    };

    try {
        useEffect(() => {
            fetchprofileInfo()
        }, [])
    } catch (error) {
        console.log("Error aagya hai catch block main")
    }
    return (
        <>
            <div className="space-y-6">
                <h2 className="text-5xl font-extrabold transition-colors duration-500 text-[#333333]">Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <UserRound className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">Username</span>
                            <p className="text-gray-800">{profile?.userName.toUpperCase() || "N/A"}</p>
                        </div>
                        {
                            userRole === "owner"
                                ?
                                null
                                :
                                <>
                                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                        <DialogTrigger asChild>
                                            <Pencil className="h-3 w-3 mt-5 text-green-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out" />
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Revise username</DialogTitle>
                                                <DialogDescription>
                                                    Change username here. Click save when you're done.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <UpdateUserName userName={profile.userName} userId={profile.userId} fetchprofileInfo={fetchprofileInfo} onSuccess={() => setIsOpen(false)} />
                                        </DialogContent>
                                    </Dialog>
                                </>
                        }
                    </div>
                    <div className="flex items-center space-x-2">
                        <Mail className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">Email</span>
                            <p className="text-gray-800">{profile?.email || "N/A"}</p>
                        </div>
                        {
                            userRole === "owner"
                                ?
                                null :
                                <>
                                    <Dialog open={isOpenEmail} onOpenChange={setIsOpenEmail}>
                                        <DialogTrigger asChild>
                                            <Pencil className="h-3 w-3 mt-5 text-green-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out" />
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Revise email</DialogTitle>
                                                <DialogDescription>
                                                    Change email here. Click save when you're done.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <UpdateEmail email={profile.email} userId={profile.userId} onSuccess={() => setIsOpenEmail(false)} />
                                        </DialogContent>
                                    </Dialog>
                                </>
                        }
                    </div>
                    <div className="flex items-center space-x-2">
                        <Briefcase className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">Role</span>
                            <p className="text-gray-800">{userRole?.toUpperCase() || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">Last Login At</span>
                            <p className="text-gray-800">{new Date(profile.lastLoginAt).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <UserCheck className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">LogIn Count</span>
                            <p className="text-gray-800">{profile?.loginCount || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">Failed LogIn Attempt</span>
                            <p className="text-gray-800">{profile?.failedLoginAttempt}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {profile?.emailVerified ? <MailCheck className="h-6 w-6 text-gray-500" /> : <MailX className="h-6 w-6 text-gray-500" />}
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">Email Verified</span>
                            <p className="text-gray-800">{profile?.emailVerified ? "True" : "False"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {
                    userRole === "admin" ?
                        null
                        :
                        <>
                            <Separator className="my-8" />
                            {
                                userRole === "owner"
                                    ?
                                    <>
                                        <h2 className="text-xl font-semibold text-gray-800">Transfer an Ownership</h2>
                                        <p className="text-sm text-gray-600">Once you transfer your ownership, you will permanently lose access to all your data and will not be able to recover it.</p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="bg-red-500 text-white hover:bg-red-700 w-fit cursor-pointer transition-transform hover:scale-105 shadow-md">
                                                    <ShieldAlert className="h-4 w-4 mr-2" />
                                                    Transfer Ownership
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-red-600">Transfer Ownership</DialogTitle>
                                                </DialogHeader>
                                                {
                                                    transferOwnerShip
                                                        ?
                                                        <TransferOwnerShip ownerEmail={profile?.email} emailStatus={emailStatus} passwordStatus={passwordStatus} setEmailStatus={setEmailStatus} setPasswordStatus={setPasswordStatus} setShowSignOutLoading={setShowSignOutLoading} />
                                                        :
                                                        <>

                                                            <DeleteAndTransferAccount userId={profile.userId} operation="transfer" onSuccess={() => setIsOpenDeleteAccount(false)} transferOwnerShip={() => {
                                                                setTransferOwnerShip(true);
                                                                setEmailStatus(true);
                                                            }} />

                                                        </>
                                                }
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                    :
                                    null
                            }
                        </>
                }

                {
                    userRole === 'seller' &&

                    <>
                        <h2 className="text-xl font-semibold text-gray-800">Deactivate Account</h2>
                        <p className="text-sm text-gray-600">Once you deactive your account, you will not sign in until admin verify your account.</p>
                        <Dialog open={isOpenDeleteAccount} onOpenChange={setIsOpenDeleteAccount}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="w-fit">
                                    <PowerOff className="h-4 w-4 mr-2" />
                                    Deactivate Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-red-600">Deactivate Account</DialogTitle>
                                </DialogHeader>
                                <DeactiveAccount userId={profile.userId} onSuccess={() => setIsOpenDeleteAccount(false)} />
                            </DialogContent>
                        </Dialog>
                    </>
                }

                {
                    userRole === 'customer' &&

                    <>
                        <h2 className="text-xl font-semibold text-gray-800">Delete Account</h2>
                        <p className="text-sm text-gray-600">Once you delete your account, you will permanently lose access to all your data and will not be able to recover it.</p>
                        <Dialog open={isOpenDeleteAccount} onOpenChange={setIsOpenDeleteAccount}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="w-fit">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                                </DialogHeader>
                                <DeleteAndTransferAccount userId={profile.userId} operation="delete" onSuccess={() => setIsOpenDeleteAccount(false)} />
                            </DialogContent>
                        </Dialog>
                    </>
                }

            </div>
        </>
    )
}

const deactivateAccountSchema = z.object(
    {
        validation: z.string()
    }
)

type DeactivateAccountSchema = z.infer<typeof deactivateAccountSchema>

interface DeactivateAccountProps {
    userId: number;
    onSuccess?: () => void;
}


const DeactiveAccount = ({ userId, onSuccess }: DeactivateAccountProps) => {
    const router = useRouter();
    const form = useForm<DeactivateAccountSchema>({
        resolver: zodResolver(deactivateAccountSchema),
        defaultValues: {
            validation: ""
        },
    });
    const onSubmit = (values: DeactivateAccountSchema) => {
        let validValue = values.validation.toLowerCase();
        if (validValue === "deactivate") {
            const deactivateAccount = async () => {
                const response = await fetch('/api/inactive-seller-account', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                const data = await response.json();
                if (data.status === 200) {
                    console.log(data.message);
                    if (onSuccess) onSuccess();
                    successNotifier.notify(data.message);
                    handleSignOut();
                    router.push('/sign-in')
                }
            }
            deactivateAccount();
        } else {
            alert("Enter deactivate in box")
        }

    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <>
                    <FormField
                        control={form.control}
                        name="validation"
                        render={({ field }) => (
                            <FormItem >
                                <FormLabel className="block">To deactivate your account, please type <span className="font-semibold text-red-600 inline-block">Deactivate</span> in the box below</FormLabel>
                                <FormControl>
                                    <Input placeholder="Type deactivate here!" {...field} className="mt-1" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" variant="destructive" className="mb-2" > <PowerOff className="h-4 w-4 mr-2" />Deactivate Account</Button>
                </>
        </form>
        </Form >
    )
}




type TransferAccountSchema = {
    email?: string,
    password?: string
}


interface PropsTOS {
    ownerEmail: string;
    emailStatus: boolean;
    passwordStatus: boolean;
    setEmailStatus: (status: boolean) => void;
    setPasswordStatus: (status: boolean) => void;
    setShowSignOutLoading: (status: boolean) => void;
}

const TransferOwnerShip = ({ ownerEmail, emailStatus, passwordStatus, setEmailStatus, setPasswordStatus, setShowSignOutLoading }: PropsTOS) => {
    const [showForm, setShowForm] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShowForm(true), 1000);
        return () => clearTimeout(timer);
    }, []);
    if (!showForm) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-gray-500 text-sm animate-pulse">Loading ...</div>
            </div>
        );
    }
    if (emailStatus) {
        return (
            <TransferEmailFormField ownerEmail={ownerEmail} emailStatus={emailStatus} setEmailStatus={setEmailStatus} setPasswordStatus={setPasswordStatus} />
        )
    }
    if (passwordStatus) {
        return (
            <TransferPasswordFormField ownerEmail={ownerEmail} emailStatus={emailStatus} setEmailStatus={setEmailStatus} setPasswordStatus={setPasswordStatus} />
        )
    }
    return (
        <TransferOwnerShipUIForm ownerEmail={ownerEmail} setShowSignOutLoading={setShowSignOutLoading} />
    )
}



//New File content

type TransferOwnerShipUIFormSchema = {
    fullOwnerName: string,
    ownerEmail: string,
    ownerPassword: string
}

interface TransferOwnerShipUIFormProps {
    ownerEmail?: string,
    setShowSignOutLoading: (status: boolean) => void;
}


const TransferOwnerShipUIForm = ({ ownerEmail, setShowSignOutLoading }: TransferOwnerShipUIFormProps) => {
    const form = useForm<TransferOwnerShipUIFormSchema>({
        defaultValues: {
            fullOwnerName: '',
            ownerEmail: '',
            ownerPassword: ''
        },
        shouldUnregister: true,
    });

    const onSubmit = async (values: TransferOwnerShipUIFormSchema) => {
        alert(`Full Name: ${values.fullOwnerName}, Email: ${values.ownerEmail}, Password: ${values.ownerPassword}`);
        const response = await fetch('/api/transfer-ownership', {
            method: 'POST',
            body: JSON.stringify({
                newOwnerName: values.fullOwnerName,
                newOwnerEmail: values.ownerEmail,
                newOwnerPassword: values.ownerPassword,
                ownerEmail: ownerEmail
            })
        });
        if (response.ok) {
            const data = await response.json();
            const status = data.status;
            const message = data.message;
            alert(message);
            console.log(status);
            successNotifier.notify(message);
            setShowSignOutLoading(true);
            handleSignOut();
        }
    }

    return (
        <>
            {
                <Form {...form} key="step-email" >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-2 space-y-6">
                        <FormField
                            control={form.control}
                            name="fullOwnerName"
                            render={({ field }) => (
                                <FormItem >
                                    <FormLabel className="block">
                                        New Owner fullname
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter new owner fullname"
                                            {...field}
                                            className="mt-2"
                                        />
                                    </FormControl>

                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ownerEmail"
                            render={({ field }) => (
                                <FormItem >
                                    <FormLabel className="block">
                                        Owner email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Enter new owner email"
                                            {...field}
                                            className="mt-2"
                                        />
                                    </FormControl>

                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ownerPassword"
                            render={({ field }) => (
                                <FormItem >
                                    <FormLabel className="block">
                                        New Owner password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter new owner password"
                                            {...field}
                                            className="mt-2"
                                        />
                                    </FormControl>

                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="destructive" className="relative bottom-4 mt-5 p-0" >
                            <ArrowRightLeft className="h-4 w-4" /> Transfer Ownership
                        </Button>
                    </form>
                </Form >
            }

        </>
    )

}
















































type EmailSchema = {
    email: string,
}

interface TransferEmailFormFieldProps {
    ownerEmail: string;
    emailStatus: boolean;
    setEmailStatus: (status: boolean) => void;
    setPasswordStatus: (status: boolean) => void;
}


const TransferEmailFormField = ({ ownerEmail, emailStatus, setEmailStatus, setPasswordStatus }: TransferEmailFormFieldProps) => {
    const form = useForm<EmailSchema>({
        defaultValues: {
            email: ''
        },
        shouldUnregister: true,
    });

    const onSubmit = (values: EmailSchema) => {
        let validEmail = values.email;
        if (validEmail === ownerEmail) {
            successNotifier.notify("Email successfully verified ! Proceed to next steps");
            form.reset();
            setEmailStatus(false);
            setPasswordStatus(true);
        } else {
            errorNotifier.notify("Email does not match with owner email. Please enter correct email");
        }
    }

    return (
        <>
            <Form {...form} key="step-email">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem >
                                <FormLabel className="block">
                                    To transfer your account, please enter your <span className="font-semibold text-gray-600 inline-block">current email address</span> below
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="Enter your current email"
                                        {...field}
                                        className="mt-2"
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />
                    <Button type="submit" variant="secondary" className="relative bottom-4 m-0 p-0" >
                        <MailOpen className="h-4 w-4 mr-2" />
                    </Button>
                </form>
            </Form >
        </>
    )

}

//New File content

type PasswordSchema = {
    password: string,
}

interface TransferPasswordFormFieldProps {
    ownerEmail: string;
    emailStatus: boolean;
    setEmailStatus: (status: boolean) => void;
    setPasswordStatus: (status: boolean) => void;
}


const TransferPasswordFormField = ({ ownerEmail, emailStatus, setEmailStatus, setPasswordStatus }: TransferPasswordFormFieldProps) => {
    const form = useForm<PasswordSchema>({
        defaultValues: {
            password: ''
        },
        shouldUnregister: true,
    });


    const onSubmit = async (values: PasswordSchema) => {
        const response = await fetch('/api/verify-password', {
            method: 'POST',
            body: JSON.stringify({ password: values.password, email: ownerEmail }),
        });
        if (response.ok) {
            const data = await response.json();
            const status = data.status;
            if (status === 200) {
                successNotifier.notify(data.message);
                form.reset();
                setPasswordStatus(false);
            }
            if (status === 400 || status === 500) {
                errorNotifier.notify(data.message)
            }
        }
    }


    return (
        <>
            <Form {...form} key="step-email">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem >
                                <FormLabel className="block">
                                    To transfer your account, please enter your <span className="font-semibold text-gray-600 inline-block">current password</span> below
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter your current password"
                                        {...field}
                                        className="mt-2"
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />
                    <Button type="submit" variant="secondary" className="relative bottom-4 m-0 p-0" >
                        <Key className="h-4 w-4 mr-2" />
                    </Button>
                </form>
            </Form >
        </>
    )

}





























































































































const deleteAndTransferAccountSchema = z.object(
    {
        validation: z.string()
    }
)

type DeleteAndTransferAccountSchema = z.infer<typeof deleteAndTransferAccountSchema>

interface DeleteAndTransferAccountProps {
    userId: number;
    operation: "delete" | "transfer";
    onSuccess?: () => void;
    transferOwnerShip?: () => void;
}

export const DeleteAndTransferAccount = ({ userId, onSuccess, operation, transferOwnerShip }: DeleteAndTransferAccountProps) => {
    const router = useRouter();
    const form = useForm<DeleteAndTransferAccountSchema>({
        resolver: zodResolver(deleteAndTransferAccountSchema),
        defaultValues: {
            validation: ""
        },
    });
    const onSubmit = (values: DeleteAndTransferAccountSchema) => {
        let validValue = values.validation.toLowerCase();
        if (validValue === "delete") {
            const deletingAccount = async () => {
                const response = await fetch('/api/delete-account', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                const data = await response.json();
                if (response.ok && data.status === 200) {
                    console.log(data.message);
                    if (onSuccess) onSuccess();
                    successNotifier.notify('Delete account successfully. Redirecting to sign-up');
                    router.push('/sign-up')
                } else {
                    console.error('Deleting account failed:', data.message || 'An error occurred');
                    errorNotifier.notify("Deleting account failed: ${data.message || 'An error occurred");
                }
            }
            deletingAccount();
        } else if (validValue === "transfer") {
            if (transferOwnerShip) transferOwnerShip();
            successNotifier.notify("You are owner, you can't delete your account. Please transfer ownership first.")
        } else {
            alert("Enter delete in box")
        }

    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {
                    operation === "delete"
                        ?
                        <>
                            <FormField
                                control={form.control}
                                name="validation"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel className="block">To delete your account, please type <span className="font-semibold text-red-600 inline-block">Delete</span> in the box below</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Type delete here!" {...field} className="mt-1" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="destructive" className="mb-2" > <Trash2 className="h-4 w-4 mr-2" />Delete Account</Button>
                        </>
                        :
                        <>
                            <FormField
                                control={form.control}
                                name="validation"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel className="block">To transfer your account, please type <span className="font-semibold text-red-600 inline-block">Transfer</span> in the box below</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Type transfer here!" {...field} className="mt-1" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="destructive" className="mb-2" > <ShieldAlert className="h-4 w-4 mr-2" />Transfer Ownership</Button>
                        </>
                }
            </form>
        </Form>
    )
}

//New File content

const updateUsernameSchema = z.object(
    {
        userName: z.string()
    }
)

type UpdateUsernameSchema = z.infer<typeof updateUsernameSchema>



interface UpdateUserNameProps {
    userName: string;
    userId: number;
    fetchprofileInfo: () => Promise<void>;
    onSuccess?: () => void;
}

const UpdateUserName = ({ userName, userId, fetchprofileInfo, onSuccess }: UpdateUserNameProps) => {

    const form = useForm<UpdateUsernameSchema>({
        resolver: zodResolver(updateUsernameSchema),
        defaultValues: {
            userName: userName
        },
    });


    const onSubmit = (values: UpdateUsernameSchema) => {
        const updatingUsername = async () => {
            const response = await fetch('/api/update-username', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ userName: values.userName, userId })
            });
            const data = await response.json();
            if (response.ok && data.status === 200) {
                console.log(data.message);
                if (onSuccess) onSuccess();
                successNotifier.notify("UserName updated successfully");

                fetchprofileInfo();
            } else {
                console.error('UserName update failed:', data.message || 'An error occurred');
                errorNotifier.notify("Can't update username")
            }
        }
        updatingUsername();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>UserName</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter Updated UserName" {...field} className="mt-1" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit"  >Revise Username</Button>
            </form>
        </Form>
    )
}


const updateEmailSchema = z.object(
    {
        email: z.string()
    }
)

type UpdateEmailSchema = z.infer<typeof updateEmailSchema>


interface UpdateEmailProps {
    email: string;
    userId: number,
    onSuccess?: () => void;
}

const UpdateEmail = ({ email, userId, onSuccess }: UpdateEmailProps) => {
    const router = useRouter();

    const form = useForm<UpdateEmailSchema>({
        resolver: zodResolver(updateEmailSchema),
        defaultValues: {
            email: email
        },
    });

    const onSubmit = (values: UpdateEmailSchema) => {

        const updatingEmail = async () => {
            const response = await fetch('/api/update-email', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ email: values.email, userId })
            });
            const data = await response.json();
            if (response.ok && data.status === 200) {
                console.log(data.message);
                if (onSuccess) onSuccess();
                successNotifier.notify("Email updated successfully. Redirecting to sign-in.");
                router.push('/sign-in');
            } else {
                console.error('Email update failed:', data.message || 'An error occurred');
                errorNotifier.notify(`Email update failed: ${data.message || 'An error occurred'}`)
            }
        }
        updatingEmail();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter Updated Email" {...field} className="mt-1" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit"  >Revise Email</Button>
            </form>
        </Form>
    )
}

