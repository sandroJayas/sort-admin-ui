import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  id: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.STORAGE_SERVICE_URL}/admin/locations/${id}/stats`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    },
  );

  const data = await res.json();

  return new NextResponse(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
