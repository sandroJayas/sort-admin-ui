"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Calendar, ImageIcon } from "lucide-react";
import { OrderListResponse } from "@/types/order";
import { useOrder } from "@/hooks/order/useOrder";

interface OrdersTableProps {
  orders: OrderListResponse[];
  isLoading?: boolean;
  onOrderClick: (orderId: string) => void;
}

export function OrdersTable({
  orders,
  isLoading,
  onOrderClick,
}: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const orderId = orders[0]?.id;
  const { data } = useOrder(orderId);
  console.log("data", data);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      case "in_progress":
        return "outline";
      default:
        return "outline";
    }
  };

  const getOrderTypeBadge = (orderType: string) => {
    switch (orderType.toLowerCase()) {
      case "self_dropoff":
        return "Self Drop-off";
      case "pickup":
        return "Pickup";
      case "delivery":
        return "Delivery";
      default:
        return orderType
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading orders...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders.length) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>No orders found for this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No orders yet</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Orders ({orders.length})
        </CardTitle>
        <CardDescription>All orders associated with this user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Boxes</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onOrderClick(order.id)}
                >
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getOrderTypeBadge(order.order_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {order.box_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.scheduled_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(order.scheduled_date)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Not scheduled
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      {order.photo_urls.length}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
