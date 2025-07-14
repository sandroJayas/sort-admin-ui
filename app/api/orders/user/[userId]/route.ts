import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  userId: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = await params;

  // Forward query params
  const searchParams = req.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const url = queryString
    ? `${process.env.STORAGE_SERVICE_URL}/admin/orders/user/${userId}?${queryString}`
    : `${process.env.STORAGE_SERVICE_URL}/admin/orders/user/${userId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const data = await res.json();
  return new NextResponse(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
