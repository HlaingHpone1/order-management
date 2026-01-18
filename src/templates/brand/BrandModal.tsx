"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBrandModal } from "@/stores/use-brand-modal";
import { BrandFormValues, createBrand, updateBrand } from "./action";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().optional(),
});

export const BrandModal = () => {
  const { isOpen, onClose, data } = useBrandModal();
  const [loading, setLoading] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      country: "",
    },
  });

  // Populate form if editing
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        country: data.country || "",
      });
    } else {
      form.reset({
        name: "",
        country: "",
      });
    }
  }, [data, isOpen, form]);

  const onSubmit = async (values: BrandFormValues) => {
    setLoading(true);
    try {
      const result = data
        ? await updateBrand(data.id, values)
        : await createBrand(values);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Brand" : "Create Brand"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Chanel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {data ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
