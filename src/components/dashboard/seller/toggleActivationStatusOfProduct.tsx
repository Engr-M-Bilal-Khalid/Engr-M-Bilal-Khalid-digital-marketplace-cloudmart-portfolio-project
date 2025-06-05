import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { errorNotifier, successNotifier } from '@/lib/designPatterns/observerPattern/notificationTrigger';
import { zodResolver } from '@hookform/resolvers/zod';
import { PowerIcon, PowerOff } from "lucide-react";
import { useForm } from 'react-hook-form';
import "react-loading-skeleton/dist/skeleton.css";
import { z } from 'zod';



const toggleActivationStatusOfProductSchema = z.object(
    {
        validation: z.string()
    }
)

type toggleActivationStatusOfProductSchema = z.infer<typeof toggleActivationStatusOfProductSchema>

interface ToggleActivationStatusOfProductProps {
    productId: number;
    productName?: string;
    onSuccess?: () => void;
    fetchProducts: () => void;
    currentActivationStatus: string
}

const ToggleActivationStatusOfProduct = ({ productId, productName, onSuccess, fetchProducts, currentActivationStatus }: ToggleActivationStatusOfProductProps) => {
    const form = useForm<toggleActivationStatusOfProductSchema>({
        resolver: zodResolver(toggleActivationStatusOfProductSchema),
        defaultValues: {
            validation: ""
        },
    });

    const onSubmit = (values: toggleActivationStatusOfProductSchema) => {
        let validValue = values.validation.toLowerCase();
        if (validValue === 'inactive') {
            const inActiveProduct = async (value: string) => {
                const response = await fetch('/api/toggle-activation-status-of-product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId, value }),
                });

                if (!response.ok) {
                    errorNotifier.notify('Something went wrong ! Please try again');
                    throw new Error(`Failed to delete product: ${response.status}`);

                }
                const data = await response.json();
                if (data.status === 200) {
                    const message = data.message;
                    if (onSuccess) {
                        onSuccess();
                        successNotifier.notify(message);
                        fetchProducts();
                    };
                }

            }
            inActiveProduct("inactive");
        } else if (validValue === 'active') {
            const activeProduct = async (value: string) => {
                const response = await fetch('/api/toggle-activation-status-of-product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId, value }),
                });

                if (!response.ok) {
                    errorNotifier.notify('Something went wrong ! Please try again');
                    throw new Error(`Failed to delete product: ${response.status}`);

                }

                const data = await response.json();
                if (data.status === 201) {
                    const message = data.message;
                    if (onSuccess) {
                        onSuccess();
                        successNotifier.notify(message);
                        fetchProducts();
                    };
                }
            }
            activeProduct("active");
        }
        else {
            errorNotifier.notify("Type inactive in box");
        }

    };
    switch (currentActivationStatus) {
        case 'inactive':
            return (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="validation"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel className="block">To inactive {productName}, please type <span className="font-semibold text-red-600 inline-block">Inactive</span> in the box below</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Type inactive here!" {...field} className="mt-1" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="destructive" className="mb-2" > <PowerOff className="h-4 w-4 mr-2" />Inactive</Button>
                        </form>
                    </Form>
                </>
            )
        case 'active':
            return (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="validation"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel className="block">To active {productName}, please type <span className="font-semibold text-gray-600 inline-block">Active</span> in the box below</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Type active here!" {...field} className="mt-1" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="default" className="mb-2" > <PowerIcon className="h-4 w-4 mr-2" />Active</Button>
                        </form>
                    </Form>
                </>
            );
        default:
            return (
                <>
                    <h1>Invalid Status</h1>
                </>
            );
    }

}

export default ToggleActivationStatusOfProduct;