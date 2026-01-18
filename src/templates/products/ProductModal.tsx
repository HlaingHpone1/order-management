"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useProductModal } from "@/stores/use-product-modal";
import { createProduct, updateProduct } from "./action";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Brand, Category } from "@/generated/prisma/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ProductModalProps {
  brands: Brand[];
  categories: Category[];
}
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  scentFamily: z.string().optional(),
  genderTarget: z.string().optional(), // "Men", "Women", "Unisex"
  image: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductModal = ({ brands, categories }: ProductModalProps) => {
  const { isOpen, onClose, data } = useProductModal();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      brandId: "",
      categoryId: "",
      scentFamily: "",
      genderTarget: "Unisex",
      image: undefined,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        description: data.description || "",
        brandId: data.brandId,
        categoryId: data.categoryId,
        scentFamily: data.scentFamily || "",
        genderTarget: data.genderTarget || "Unisex",
      });
    } else {
      form.reset({ name: "", description: "", brandId: "", categoryId: "" });
    }
  }, [data, isOpen, form]);

  const onSubmit = async (values: ProductFormValues) => {
    if (!data && (!values.image || values.image.length === 0)) {
      form.setError("image", {
        type: "manual",
        message: "Product image is required for new products",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("brandId", values.brandId);
    formData.append("categoryId", values.categoryId);
    formData.append("scentFamily", values.scentFamily || "");
    formData.append("genderTarget", values.genderTarget || "");

    // Append File if exists
    if (values.image && values.image.length > 0) {
      formData.append("image", values.image[0]);
    }

    try {
      const result = data
        ? await updateProduct(data.id, formData)
        : await createProduct(formData);

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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Product" : "Create Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genderTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Men">Men</SelectItem>
                        <SelectItem value="Women">Women</SelectItem>
                        <SelectItem value="Unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scentFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scent Family</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Woody, Floral"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>
                    Product Image <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const files = event.target.files;
                        if (files && files.length > 0) {
                          onChange(files);
                          // Clear error immediately when file is picked
                          form.clearErrors("image");
                        }
                      }}
                    />
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
