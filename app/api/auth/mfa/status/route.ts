import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // In a real implementation, you'd check the user's MFA status
  // This could be stored in your database or retrieved from Auth0's Management API
  // For now, we'll return a mock response

  // You could store MFA status in your database when users enable/disable it
  // Or use Auth0 Management API to check: https://auth0.com/docs/api/management/v2

  return NextResponse.json({
    enabled: false, // This would come from your database or Auth0
    methods: ["authenticator"], // Auth0 supports various MFA methods
  });
}
