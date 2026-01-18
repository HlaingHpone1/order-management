"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategoryModal } from "@/stores/use-category-modal";
import { CategoryFormValues, createCategory, updateCategory } from "./action";
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
  FormDescription,
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
import { Category } from "@/generated/prisma/client";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  parentCategoryId: z.string().optional().nullable(),
});

// Helper to auto-generate slug
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -

interface CategoryModalProps {
  availableParents: Category[]; // Passed from parent to populate dropdown
}

export const CategoryModal = ({ availableParents }: CategoryModalProps) => {
  const { isOpen, onClose, data } = useCategoryModal();
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parentCategoryId: "none", // Using "none" as a placeholder for null
    },
  });

  // Effect: Populate form on open
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        slug: data.slug,
        parentCategoryId: data.parentCategoryId || "none",
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        parentCategoryId: "none",
      });
    }
  }, [data, isOpen, form]);

  // Effect: Auto-generate slug from name if creating new
  const watchedName = form.watch("name");
  useEffect(() => {
    if (!data && watchedName) {
      form.setValue("slug", slugify(watchedName));
    }
  }, [watchedName, data, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true);

    // Convert "none" placeholder back to null
    const payload = {
      ...values,
      parentCategoryId:
        values.parentCategoryId === "none" ? null : values.parentCategoryId,
    };

    try {
      const result = data
        ? await updateCategory(data.id, payload)
        : await createCategory(payload);

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
          <DialogTitle>
            {data ? "Edit Category" : "Create Category"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Perfumes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. perfumes" {...field} />
                  </FormControl>
                  <FormDescription>Unique URL identifier</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Category Select */}
            <FormField
              control={form.control}
              name="parentCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        -- No Parent (Top Level) --
                      </SelectItem>
                      {availableParents
                        .filter((c) => c.id !== data?.id) // Prevent selecting self
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
