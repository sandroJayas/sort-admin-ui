"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar, Shield, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { OrdersTable } from "@/components/order/OrdersTable";
import Layout from "@/components/kokonutui/layout";
import { useOrders } from "@/hooks/order/useOrders";
import { useUser } from "@/hooks/useUser";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: user, isLoading: userLoading, error: userError } = useUser(id);
  const { data: orderData, isLoading: ordersLoading } = useOrders({
    userId: id,
  });

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccountTypeBadgeVariant = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case "customer":
        return "default";
      case "admin":
        return "destructive";
      case "premium":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (userLoading) {
    return (
      <Layout page={"users"}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading user details...</div>
        </div>
      </Layout>
    );
  }

  if (userError || !user) {
    return (
      <Layout page={"users"}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">
            Error loading user details
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout page={"users"}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-muted-foreground">User Details & Order History</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
                <Badge variant={user.email_verified ? "default" : "secondary"}>
                  {user.email_verified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone_number}</span>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Account Type:</span>
                <Badge variant={getAccountTypeBadgeVariant(user.account_type)}>
                  {user.account_type}
                </Badge>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span>{user.address_line_1}</span>
                  {user.address_line_2 && <span>{user.address_line_2}</span>}
                  <span>
                    {user.city}, {user.postal_code}
                  </span>
                  <span>{user.country}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined: {formatDate(user.created_at)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Last Updated: {formatDate(user.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-semibold">{orderData?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Orders</span>
                <span className="font-semibold">
                  {orderData?.orders.filter(
                    (order) => order.status === "pending",
                  ).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed Orders</span>
                <span className="font-semibold">
                  {orderData?.orders.filter(
                    (order) => order.status === "completed",
                  ).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Boxes</span>
                <span className="font-semibold">
                  {orderData?.orders.reduce(
                    (sum, order) => sum + order.box_count,
                    0,
                  ) || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <OrdersTable
        orders={orderData?.orders || []}
        isLoading={ordersLoading}
        onOrderClick={handleOrderClick}
      />
    </Layout>
  );
}
