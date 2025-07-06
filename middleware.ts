import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // where to redirect if user is not logged in
  },
});

export const config = {
  matcher: ["/boxes/:path*"], // protected routes
};
