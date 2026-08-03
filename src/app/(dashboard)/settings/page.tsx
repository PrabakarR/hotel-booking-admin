"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageHeaderSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSettings, useSettingsMutation } from "@/hooks/use-settings";
import { hotelSettingsSchema, type HotelSettingsFormValues } from "@/schemas";

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const mutation = useSettingsMutation();
  const { theme, setTheme } = useTheme();

  const form = useForm<HotelSettingsFormValues>({
    resolver: zodResolver(hotelSettingsSchema),
    defaultValues: {
      hotelName: "",
      logo: "",
      gstNumber: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      hotelName: data.hotelName,
      logo: data.logo ?? "",
      gstNumber: data.gstNumber,
      address: data.address,
      phone: data.phone,
      email: data.email,
    });
  }, [data, form]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Hotel profile, branding, and theme preferences.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Hotel Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                await mutation.mutateAsync(values);
                toast.success("Settings saved");
              })}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <Input
                    id="hotelName"
                    className="rounded-2xl"
                    {...form.register("hotelName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    className="rounded-2xl"
                    {...form.register("gstNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" className="rounded-2xl" {...form.register("phone")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" className="rounded-2xl" {...form.register("email")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    className="rounded-2xl"
                    {...form.register("address")}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="logo">Hotel Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="rounded-2xl"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        form.setValue("logo", String(reader.result ?? ""));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {form.watch("logo") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.watch("logo")}
                      alt="Hotel logo preview"
                      className="mt-3 h-16 w-16 rounded-2xl border object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="rounded-2xl"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="size-4 text-muted-foreground" />
                ) : (
                  <Sun className="size-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark appearance
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
