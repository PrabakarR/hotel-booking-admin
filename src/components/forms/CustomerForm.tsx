"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerSchema, type CustomerFormValues } from "@/schemas";
import type { Customer } from "@/types";

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      idProof: initialData?.idProof ?? "",
      address: initialData?.address ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Customer Name</Label>
          <Input id="name" className="rounded-2xl" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" className="rounded-2xl" {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="rounded-2xl" {...form.register("email")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="idProof">ID Proof</Label>
          <Input id="idProof" className="rounded-2xl" {...form.register("idProof")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" className="rounded-2xl" {...form.register("address")} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-2xl">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="rounded-2xl">
          {loading ? "Saving..." : initialData ? "Update Customer" : "Add Customer"}
        </Button>
      </div>
    </form>
  );
}
