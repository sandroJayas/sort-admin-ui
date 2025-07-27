"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  Calendar,
  AlertCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Layout from "@/components/kokonutui/layout";
import {
  OrderStatus,
  OrderType,
  OrderListResponse,
  fromISODateString,
} from "@/types/order";
import { useOrdersByStatus } from "@/hooks/order/useOrdersByStatus";

interface OrderTableProps {
  orders: OrderListResponse[];
  title: string;
  description: string;
  icon: React.ReactNode;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onOrderClick: (orderId: string) => void;
  emptyMessage: string;
}

function OrderTable({
  orders,
  title,
  description,
  icon,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onOrderClick,
  emptyMessage,
}: OrderTableProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = fromISODateString(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getOrderTypeLabel = (type: string): string => {
    switch (type) {
      case OrderType.SELF_DROPOFF:
        return "Self Drop-off";
      case OrderType.READY_FOR_PICKUP:
        return "Ready for Pickup";
      case OrderType.BOX_PROVIDED:
        return "Box Provided";
      default:
        return type;
    }
  };

  const getOrderTypeBadgeVariant = (
    type: string,
  ): "default" | "secondary" | "outline" => {
    switch (type) {
      case OrderType.SELF_DROPOFF:
        return "default";
      case OrderType.READY_FOR_PICKUP:
        return "secondary";
      case OrderType.BOX_PROVIDED:
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case OrderStatus.PENDING:
        return "secondary";
      case OrderStatus.PROCESSING:
        return "default";
      case OrderStatus.COMPLETED:
        return "outline";
      case OrderStatus.CANCELLED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, orders.length);
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const displayStartIndex = orders.length > 0 ? startIndex + 1 : 0;
  const displayEndIndex = endIndex;

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          Showing {displayStartIndex}-{displayEndIndex} of {orders.length}{" "}
          orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Boxes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Photos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onOrderClick(order.id)}
                >
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOrderTypeBadgeVariant(order.order_type)}>
                      {getOrderTypeLabel(order.order_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{order.box_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.scheduled_date ? (
                      <span className="text-sm">
                        {formatDate(order.scheduled_date)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.photo_urls && order.photo_urls.length > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {order.photo_urls.length} photo
                        {order.photo_urls.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <p className="text-sm text-muted-foreground">per page</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const router = useRouter();

  // Separate pagination states for each table
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(20);
  const [processingCurrentPage, setProcessingCurrentPage] = useState(1);
  const [processingPageSize, setProcessingPageSize] = useState(20);
  const [showAllProcessing, setShowAllProcessing] = useState(false);

  // Fetch orders by status
  const {
    data: pendingData,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useOrdersByStatus(OrderStatus.PENDING);

  const {
    data: processingData,
    isLoading: processingLoading,
    error: processingError,
    refetch: refetchProcessing,
  } = useOrdersByStatus(OrderStatus.PROCESSING);

  // Filter processing orders for today
  const filterTodaysOrders = (
    orders: OrderListResponse[],
  ): OrderListResponse[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return orders.filter((order) => {
      if (!order.scheduled_date) return false;
      try {
        const scheduledDate = fromISODateString(order.scheduled_date);
        return scheduledDate >= today && scheduledDate < tomorrow;
      } catch {
        return false;
      }
    });
  };

  // Get filtered processing orders based on toggle
  const getProcessingOrders = (): OrderListResponse[] => {
    if (!processingData?.orders) return [];
    return showAllProcessing
      ? processingData.orders
      : filterTodaysOrders(processingData.orders);
  };

  // Count today's orders for the badge
  const todaysOrdersCount = useMemo(() => {
    if (!processingData?.orders) return 0;
    return filterTodaysOrders(processingData.orders).length;
  }, [processingData]);

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleRefreshAll = () => {
    refetchPending();
    refetchProcessing();
  };

  // Loading state
  if (pendingLoading || processingLoading) {
    return (
      <Layout page={"orders"}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Loading orders...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Error state
  if (pendingError || processingError) {
    return (
      <Layout page={"orders"}>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-3">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <p className="text-lg text-destructive">
                  {pendingError instanceof Error
                    ? pendingError.message
                    : processingError instanceof Error
                      ? processingError.message
                      : "Error loading orders"}
                </p>
                <Button onClick={handleRefreshAll} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout page={"orders"}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">
              Manage pending and processing orders
            </p>
          </div>
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>

        {/* Pending Orders Table */}
        <OrderTable
          orders={pendingData?.orders || []}
          title="Pending Orders"
          description="Orders waiting for approval"
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
          currentPage={pendingCurrentPage}
          pageSize={pendingPageSize}
          onPageChange={setPendingCurrentPage}
          onPageSizeChange={(size) => {
            setPendingPageSize(size);
            setPendingCurrentPage(1);
          }}
          onOrderClick={handleOrderClick}
          emptyMessage="No pending orders"
        />

        {/* Processing Orders Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Processing Orders
              </h2>
              {todaysOrdersCount > 0 && !showAllProcessing && (
                <Badge variant="default" className="bg-blue-600">
                  {todaysOrdersCount} today
                </Badge>
              )}
              {showAllProcessing && processingData?.orders && (
                <Badge variant="outline">
                  {processingData.orders.length} total
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showAllProcessing ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  setShowAllProcessing(false);
                  setProcessingCurrentPage(1);
                }}
              >
                Today&#39;s Orders
              </Button>
              <Button
                variant={showAllProcessing ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowAllProcessing(true);
                  setProcessingCurrentPage(1);
                }}
              >
                All Processing
              </Button>
            </div>
          </div>

          <OrderTable
            orders={getProcessingOrders()}
            title={
              showAllProcessing
                ? "All Processing Orders"
                : "Today's Processing Orders"
            }
            description={
              showAllProcessing
                ? "All orders currently being processed"
                : todaysOrdersCount === 0
                  ? "No orders scheduled for today"
                  : `Orders scheduled for ${new Date().toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}`
            }
            icon={<Clock className="h-5 w-5 text-blue-600" />}
            currentPage={processingCurrentPage}
            pageSize={processingPageSize}
            onPageChange={setProcessingCurrentPage}
            onPageSizeChange={(size) => {
              setProcessingPageSize(size);
              setProcessingCurrentPage(1);
            }}
            onOrderClick={handleOrderClick}
            emptyMessage={
              showAllProcessing
                ? "No orders in processing"
                : "No orders scheduled for today"
            }
          />
        </div>
      </div>
    </Layout>
  );
}
