import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { errorNotifier, successNotifier } from '@/lib/designPatterns/observerPattern/notificationTrigger';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import "react-loading-skeleton/dist/skeleton.css";
import { z } from 'zod';

const deleteProductSchema = z.object(
  {
    validation: z.string()
  }
)

type DeleteProductSchema = z.infer<typeof deleteProductSchema>

interface DeleteProductProps {
  productId: number;
  onSuccess?: () => void;
  fetchProducts:()=>void;
}

const DeleteProduct = ({ productId, onSuccess , fetchProducts}: DeleteProductProps) => {
  const form = useForm<DeleteProductSchema>({
    resolver: zodResolver(deleteProductSchema),
    defaultValues: {
      validation: ""
    },
  });
 
  const onSubmit = (values: DeleteProductSchema) => {
    let validValue = values.validation.toLowerCase();
    if (validValue === "delete") {
      const deletingProduct = async () => {
        const response = await fetch('/api/delete-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          errorNotifier.notify('Something went wrong ! Please try again');
          throw new Error(`Failed to delete product: ${response.status}`);

        }

        const data = await response.json();
        console.log("Delete product response:", data);

        if(onSuccess) {
          onSuccess();
           successNotifier.notify('Product deleted successfully!');
          fetchProducts();
        };
       
         //fetchProducts(); // ✅ Refresh product list after deletion
      }
      deletingProduct();
    } else {
      alert("Enter delete in box")
    }

  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="validation"
          render={({ field }) => (
            <FormItem >
              <FormLabel className="block">To delete product, please type <span className="font-semibold text-red-600 inline-block">Delete</span> in the box below</FormLabel>
              <FormControl>
                <Input placeholder="Type delete here!" {...field} className="mt-1" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" variant="destructive" className="mb-2 bg-gradient-to-br from-red-50 to-red-700 text-slate-950" > <Trash2 className="h-4 w-4 mr-2" />Delete</Button>
      </form>
    </Form>
  )
};


export default DeleteProduct
