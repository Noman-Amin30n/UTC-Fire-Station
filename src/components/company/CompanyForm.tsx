"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { companyFormSchema, type CompanyFormValues } from "@/schemas/company.schema";
import type { CompanyActionState } from "@/actions/company-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CompanyFormProps = {
  action: (prevState: CompanyActionState, formData: FormData) => Promise<CompanyActionState>;
  defaultValues?: Partial<CompanyFormValues>;
  existingImageUrl?: string;
  submitLabel: string;
};

export function CompanyForm({ action, defaultValues, existingImageUrl, submitLabel }: CompanyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(existingImageUrl ?? null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CompanyFormValues>({ resolver: zodResolver(companyFormSchema), defaultValues });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  function onSubmit(values: CompanyFormValues) {
    if (!existingImageUrl && !imageFile) {
      setError("root", { message: "A map image is required" });
      return;
    }

    setServerError(null);
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("address", values.address);
    formData.set("phone", values.phone ?? "");
    formData.set("email", values.email ?? "");
    formData.set("contactPerson", values.contactPerson ?? "");
    formData.set("companyCode", values.companyCode ?? "");
    formData.set("notes", values.notes ?? "");
    if (imageFile) formData.set("image", imageFile);

    startTransition(async () => {
      try {
        const result = await action({}, formData);
        if (result?.error) setServerError(result.error);
      } catch {
        setServerError("Something went wrong saving this company — please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Full address</Label>
        <Textarea id="address" {...register("address")} />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Emergency contact person</Label>
          <Input id="contactPerson" {...register("contactPerson")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyCode">Company code</Label>
          <Input id="companyCode" {...register("companyCode")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Gate numbers, hazmat flags, access restrictions…" {...register("notes")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Map image {existingImageUrl ? "(leave empty to keep current)" : ""}</Label>
        <Input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
        {preview && (
          <Image
            src={preview}
            alt="Map preview"
            width={320}
            height={200}
            className="rounded-md border border-border object-cover"
            unoptimized
          />
        )}
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}