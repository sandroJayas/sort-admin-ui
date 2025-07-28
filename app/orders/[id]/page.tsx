"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  CalendarIcon,
  MapPinIcon,
  PackageIcon,
  ClockIcon,
  StickyNoteIcon,
  SettingsIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloudyIcon as PendingIcon,
  XCircleIcon,
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/kokonutui/layout";
import { PhotoGallery } from "@/components/order/PhotoGallery";
import { useOrder } from "@/hooks/order/useOrder";
import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApproveOrder } from "@/hooks/order/useApproveOrder";
import { toast } from "sonner";
import { useRejectOrder } from "@/hooks/order/useRejectOrder";
import IntakeModal from "@/components/box/intake-modal";
import { OrderStatus } from "@/types/order";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

const Page = ({ params }: OrderDetailsPageProps) => {
  const { id } = use(params);
  const { data: order, error, isLoading } = useOrder(id);
  const { mutate: approveOrder, isPending: isApproving } = useApproveOrder();
  const { mutate: rejectOrder, isPending: isRejecting } = useRejectOrder();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleApprove = (orderId: string) => {
    approveOrder(
      {
        id: orderId,
        data: {
          notes: "Order approved by admin",
        },
      },
      {
        onSuccess: () => {
          toast.success("Order approved successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleReject = (orderId: string) => {
    rejectOrder(
      {
        id: orderId,
        data: {
          reason: "Reject",
        },
      },
      {
        onSuccess: () => {
          toast.success("Order rejected");
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
            </div>
            <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto ">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              {error?.message || "The requested order could not be loaded"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          color:
            "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200",
          icon: PendingIcon,
          bgColor: "from-amber-50 to-yellow-50",
        };
      case "processing":
        return {
          color:
            "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
          icon: SettingsIcon,
          bgColor: "from-blue-50 to-cyan-50",
        };
      case "completed":
        return {
          color:
            "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
          icon: CheckCircleIcon,
          bgColor: "from-green-50 to-emerald-50",
        };
      case "cancelled":
        return {
          color:
            "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
          icon: XCircleIcon,
          bgColor: "from-red-50 to-rose-50",
        };
      case "scheduled":
        return {
          color:
            "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
          icon: CalendarIcon,
          bgColor: "from-purple-50 to-violet-50",
        };
      default:
        return {
          color:
            "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
          icon: AlertCircleIcon,
          bgColor: "from-gray-50 to-slate-50",
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP p");
    } catch {
      return dateString;
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Layout page={"orders"}>
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Order Details
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PackageIcon className="h-4 w-4" />
                  <span className="font-mono text-sm">{order.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full bg-gradient-to-br ${statusConfig.bgColor}`}
                >
                  <StatusIcon className="h-5 w-5 text-current" />
                </div>
                <Badge
                  className={`${statusConfig.color} border px-4 py-2 text-sm font-medium`}
                >
                  {order.status.toUpperCase()}
                </Badge>
                {order.status.toLowerCase() === OrderStatus.PENDING ? (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        handleApprove(order.id);
                      }}
                      disabled={isApproving}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </Button>

                    <Dialog
                      open={isRejectDialogOpen}
                      onOpenChange={setIsRejectDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 border-red-200 hover:border-red-300  transition-all duration-200 px-6 py-2"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircleIcon className="h-5 w-5" />
                            Reject Order
                          </DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Are you sure you want to reject this order?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-red-800 mb-1">
                                Order Details
                              </p>
                              <p className="text-sm text-red-700">
                                Order ID: {order.id}
                              </p>
                              <p className="text-sm text-red-700">
                                Type:{" "}
                                {order.order_type
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </p>
                              <p className="text-sm text-red-700">
                                Boxes: {order.box_count}
                              </p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsRejectDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              handleReject(order.id);
                              setIsRejectDialogOpen(false);
                            }}
                            disabled={isRejecting}
                            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white flex-1"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Confirm Rejection
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <IntakeModal orderId={id} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enhanced Order Information */}
          <Card className=" bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                  <PackageIcon className="h-5 w-5 text-blue-600" />
                </div>
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Order Type
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="font-semibold text-lg">
                      {order.order_type.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Box Count
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="font-semibold text-lg">{order.box_count}</p>
                  </div>
                </div>
              </div>

              {order.scheduled_date && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                  <p className="text-sm font-medium text-purple-700 flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Scheduled Date
                  </p>
                  <p className="font-semibold text-purple-900">
                    {formatDate(order.scheduled_date)}
                  </p>
                </div>
              )}

              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Created
                  </p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="font-medium">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Address Information */}
          <Card className=" bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                  <MapPinIcon className="h-5 w-5 text-green-600" />
                </div>
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <p className="font-semibold text-lg text-gray-900">
                  {order.address.street}
                </p>
                <p className="text-gray-700 font-medium">
                  {order.address.zip_code} {order.address.city}
                </p>
                <p className="text-gray-600 font-medium">
                  {order.address.country}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Photos Section */}
        {order.photo_urls && order.photo_urls.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-pink-200">
                  <PackageIcon className="h-5 w-5 text-pink-600" />
                </div>
                Order Photos
                <Badge variant="secondary" className="ml-auto">
                  {order.photo_urls.length}{" "}
                  {order.photo_urls.length === 1 ? "photo" : "photos"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallery photos={order.photo_urls} />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enhanced Boxes */}
          {order.boxes && order.boxes.length > 0 && (
            <Card className=" bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
                    <PackageIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  Boxes
                  <Badge variant="secondary" className="ml-auto">
                    {order.boxes.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.boxes.map((box) => {
                    const boxStatusConfig = getStatusConfig(box.status);
                    const BoxStatusIcon = boxStatusConfig.icon;
                    return (
                      <div
                        key={box.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${boxStatusConfig.bgColor}`}
                          >
                            <BoxStatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {box.name || `Box ${box.id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                              ID: {box.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <Badge className={`${boxStatusConfig.color} border`}>
                          {box.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Operations */}
          {order.operations && order.operations.length > 0 && (
            <Card className=" bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200">
                    <SettingsIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  Operations
                  <Badge variant="secondary" className="ml-auto">
                    {order.operations.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.operations.map((operation) => {
                    const opStatusConfig = getStatusConfig(operation.status);
                    const OpStatusIcon = opStatusConfig.icon;
                    return (
                      <div
                        key={operation.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${opStatusConfig.bgColor}`}
                          >
                            <OpStatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {operation.operation_type
                                .replace("_", " ")
                                .toUpperCase()}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                              ID: {operation.id.slice(0, 8)}...
                            </p>
                            {operation.scheduled_date && (
                              <p className="text-sm text-muted-foreground">
                                Scheduled:{" "}
                                {formatDate(operation.scheduled_date)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={`${opStatusConfig.color} border`}>
                          {operation.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Notes and Extra Data */}
        <div className="grid gap-6 lg:grid-cols-2">
          {order.notes && (
            <Card className=" bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
                    <StickyNoteIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {order.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {order.extra_data && Object.keys(order.extra_data).length > 0 && (
            <Card className=" bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200">
                    <SettingsIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(order.extra_data).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                    >
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        {key.replace("_", " ")}
                      </span>
                      <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Page;
