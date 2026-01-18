"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useInventoryModal } from "@/stores/use-inventory-modal";
import { createBatch, updateBatch } from "./action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// --- Schema ---
const inventorySchema = z.object({
  variantId: z.string().min(1, "Variant is required"),
  quantity: z.string().min(1, "Quantity is required"),
  costPrice: z.string().min(1, "Cost is required"),
  expiryDate: z.string().optional().nullable(),
  supplier: z.string().optional(),
  batchNumber: z.string().optional(),
});

type FormValues = z.infer<typeof inventorySchema>;

interface VariantOption {
  id: string;
  name: string;
  sku: string;
  productName: string;
}

interface InventoryModalProps {
  variants: VariantOption[];
}

export const InventoryModal = ({ variants }: InventoryModalProps) => {
  const { isOpen, onClose, data } = useInventoryModal();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      variantId: "",
      quantity: "",
      costPrice: "",
      expiryDate: "",
      batchNumber: "",
    },
  });

  useEffect(() => {
    if (data) {
      const dateStr = data.expiryDate
        ? new Date(data.expiryDate).toISOString().split("T")[0]
        : "";

      form.reset({
        variantId: data.variantId,
        quantity: data.quantityOnHand.toString(),
        costPrice: data.costPrice.toString(),
        expiryDate: dateStr,
        batchNumber: data.batchCode,
      });
    } else {
      form.reset({
        variantId: "",
        quantity: "",
        costPrice: "",
        expiryDate: "",
        batchNumber: "",
      });
    }
  }, [data, isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const payload = {
      ...values,
      expiryDate: values.expiryDate ? new Date(values.expiryDate) : null,
    };

    try {
      const result = data
        ? await updateBatch(data.id, payload)
        : await createBatch(payload);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Batch" : "Receive Stock"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="variantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Variant</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!data}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SKU" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {variants.map((v) => (
                        <SelectItem
                          className="w-full truncate"
                          key={v.id}
                          value={v.id}
                        >
                          {v.sku} - {v.productName} ({v.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Auto-generated" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {data ? "Update" : "Receive"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
