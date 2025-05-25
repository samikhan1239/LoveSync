import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith("/dashboard/admin")) {
        return token?.role === "admin";
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/profiles/:path*"],
};
