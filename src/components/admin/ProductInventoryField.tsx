"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { ProductInventoryInputs } from "@/components/admin/ProductInventoryInputs";
import type { ProductFormValues } from "@/lib/validation/product";

export function ProductInventoryField({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const colors = useWatch({ control: form.control, name: "colors" });
  const sizes = useWatch({ control: form.control, name: "sizes" });
  const stock = useWatch({ control: form.control, name: "stock" });
  const errors: Record<string, string | undefined> = {};
  colors.forEach((color, index) => {
    const inventoryErrors = form.formState.errors.colors?.[index]?.inventory;
    errors[`${index}`] = inventoryErrors?.message;
    color.inventory?.forEach((entry, inventoryIndex) => {
      errors[`${index}.${entry.size}`] = inventoryErrors?.[inventoryIndex]?.quantity?.message;
    });
  });

  return <ProductInventoryInputs colors={colors} sizes={sizes} stock={stock} errors={errors}
    onChange={(next) => form.setValue("colors", next, { shouldDirty: true, shouldValidate: true })} />;
}
