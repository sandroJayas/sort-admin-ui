"use client";
import React, { useState } from "react";
import Layout from "@/components/kokonutui/layout";
import { ArrowRight, Building2, Calendar, PlusIcon } from "lucide-react";
import { useStorageLocations } from "@/hooks/useStorageLocations";
import { useCreateStorageLocation } from "@/hooks/useCreateStorageLocation";
import { useUpdateStorageLocation } from "@/hooks/useUpdateStorageLocation";
import { useDeleteStorageLocation } from "@/hooks/useDeleteStorageLocation";
import { cn, stringToDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { StorageLocation } from "@/types/storage-location";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  address: z.string().min(1, "Address is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

type FormData = z.infer<typeof formSchema>;

const Page = () => {
  const { data, isLoading, error } = useStorageLocations();
  const { mutate: createLocation, isPending: isCreating } =
    useCreateStorageLocation();
  const { mutate: updateLocation, isPending: isUpdating } =
    useUpdateStorageLocation();
  const { mutate: deleteLocation, isPending: isDeleting } =
    useDeleteStorageLocation();
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<StorageLocation | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      capacity: 1,
    },
  });

  const updateForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      capacity: 1,
    },
  });

  const onSubmit = (data: FormData) => {
    createLocation(data, {
      onSuccess: () => {
        toast.success("Storage location created successfully!");
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(
          error?.message ||
            "Failed to create storage location. Please try again.",
        );
      },
    });
  };

  const onUpdate = (data: FormData) => {
    if (!selectedLocation) return;

    updateLocation(
      {
        locationId: selectedLocation.id,
        data: {
          ...data,
        },
      },
      {
        onSuccess: () => {
          toast.success("Storage location updated successfully!");
          setUpdateOpen(false);
          updateForm.reset();
          setSelectedLocation(null);
        },
        onError: (error) => {
          toast.error(
            error?.message ||
              "Failed to update storage location. Please try again.",
          );
        },
      },
    );
  };

  const onDelete = () => {
    if (!selectedLocation) return;

    deleteLocation(selectedLocation.id, {
      onSuccess: () => {
        toast.success("Storage location deleted successfully!");
        setDeleteOpen(false);
        setUpdateOpen(false);
        setSelectedLocation(null);
      },
      onError: (error) => {
        toast.error(
          error?.message ||
            "Failed to delete storage location. Please try again.",
        );
      },
    });
  };

  const handleUpdateClick = (location: StorageLocation) => {
    setSelectedLocation(location);
    updateForm.reset({
      name: location.name,
      address: location.address,
      capacity: location.capacity,
    });
    setUpdateOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23]">
          {isLoading ? (
            <>Loading...</>
          ) : (
            <div className="flex w-full justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
                Warehouse Locations
              </h2>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    Add <PlusIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Storage Location</DialogTitle>
                    <DialogDescription>
                      Create a new warehouse storage location. Fill in all the
                      required details below.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Main Warehouse"
                                {...field}
                                disabled={isCreating}
                              />
                            </FormControl>
                            <FormDescription>
                              Warehouse name (max 100 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123 Storage Street, City, State 12345"
                                {...field}
                                disabled={isCreating}
                              />
                            </FormControl>
                            <FormDescription>
                              Full address of the warehouse location
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity (sqft)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1000"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                disabled={isCreating}
                                min={1}
                              />
                            </FormControl>
                            <FormDescription>
                              Total storage capacity in square feet
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpen(false)}
                          disabled={isCreating}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isCreating}
                          className="flex-1"
                        >
                          {isCreating ? "Creating..." : "Create Location"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Update Modal */}
          <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Storage Location</DialogTitle>
                <DialogDescription>
                  Update the warehouse storage location details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...updateForm}>
                <form
                  onSubmit={updateForm.handleSubmit(onUpdate)}
                  className="space-y-4"
                >
                  <FormField
                    control={updateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Main Warehouse"
                            {...field}
                            disabled={isUpdating || isDeleting}
                          />
                        </FormControl>
                        <FormDescription>
                          Warehouse name (max 100 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Storage Street, City, State 12345"
                            {...field}
                            disabled={isUpdating || isDeleting}
                          />
                        </FormControl>
                        <FormDescription>
                          Full address of the warehouse location
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (sqft)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={isUpdating || isDeleting}
                            min={1}
                          />
                        </FormControl>
                        <FormDescription>
                          Total storage capacity in square feet
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                      disabled={isUpdating || isDeleting}
                      className="mr-auto"
                    >
                      Delete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUpdateOpen(false)}
                      disabled={isUpdating || isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating || isDeleting}>
                      {isUpdating ? "Updating..." : "Update Location"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  storage location &#34;{selectedLocation?.name}&#34; and remove
                  all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className={cn("w-full overflow-x-auto scrollbar-none")}>
            <div className="flex gap-3 min-w-full p-1">
              {data?.locations.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col",
                    "w-[280px] shrink-0",
                    "bg-white dark:bg-zinc-900/70",
                    "rounded-xl",
                    "border border-zinc-100 dark:border-zinc-800",
                    "hover:border-zinc-200 dark:hover:border-zinc-700",
                    "transition-all duration-200",
                    "shadow-sm backdrop-blur-xl",
                  )}
                >
                  <div className="p-4 space-y-5">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {item.address}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Occupied
                        </span>
                        <span className="text-zinc-900 dark:text-zinc-100">
                          {item.utilization_rate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                          style={{
                            width: `${item.utilization_rate}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.current_load} sqft
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        used
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.capacity} sqft
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        total capacity
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      <span>{stringToDate(item.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => handleUpdateClick(item)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2",
                        "py-2.5 px-3",
                        "text-xs font-medium",
                        "text-zinc-600 dark:text-zinc-400",
                        "hover:text-zinc-900 dark:hover:text-zinc-100",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                        "transition-colors duration-200",
                      )}
                    >
                      Update
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
