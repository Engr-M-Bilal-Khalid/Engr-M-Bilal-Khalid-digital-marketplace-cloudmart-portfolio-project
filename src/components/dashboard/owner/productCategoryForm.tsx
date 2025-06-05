
import React from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';
import { create } from "domain";
import { CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import { successNotifier, errorNotifier } from "@/lib/designPatterns/observerPattern/notificationTrigger";


const productCategoryCreationSchema = z.object({
    categoryName: z.string().min(1, { message: "Product name is required" }),
    categoryDescription: z.string()
});

interface ProductCategoryCreationFormProps {
    closeDialog: (status: boolean) => void,
    fetchProductCategories:()=>void,
}

export const ProductCategoryCreationForm = ({ closeDialog ,fetchProductCategories}: ProductCategoryCreationFormProps) => {
    const form = useForm<z.infer<typeof productCategoryCreationSchema>>({
        resolver: zodResolver(productCategoryCreationSchema),
        defaultValues: {
            categoryName: '',
            categoryDescription: ''
        },
    });
    async function onSubmit(values: z.infer<typeof productCategoryCreationSchema>) {
        const response = await fetch('/api/fetch-product-categories', {
            method: 'POST',
            body: JSON.stringify({
                categoryName: values.categoryName,
                categoryDescription: values.categoryDescription
            })
        });
        if (response.ok) {
            const data = await response.json();
            const message = data.message;
            if (data.status === 201) {
                closeDialog(true);
                successNotifier.notify(message);
                fetchProductCategories()
            } else {
                errorNotifier.notify(message);
            }
            alert('Chk DB now!')
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-10">
                <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name * </FormLabel>
                            <FormControl>
                                <Input placeholder="Enter Category Name" {...field} className="mt-1" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="categoryDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Description *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter Category Description (Max 20 characters)"
                                    {...field}
                                    className="mt-1 resize-none"
                                    maxLength={50}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" >Launch</Button>
            </form>
        </Form>
    )
}