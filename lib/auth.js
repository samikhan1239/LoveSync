import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { User } from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const requestId = Date.now().toString();
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log(
              JSON.stringify(
                {
                  message: "Authorize: Missing credentials",
                  requestId,
                  credentials,
                },
                null,
                2
              )
            );
            return null;
          }
          await db();
          console.log(
            JSON.stringify(
              { message: "Authorize: Database connected", requestId },
              null,
              2
            )
          );
          console.log(
            JSON.stringify(
              {
                message: "Authorize: Looking up user",
                requestId,
                email: credentials.email,
              },
              null,
              2
            )
          );

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log(
              JSON.stringify(
                {
                  message: "Authorize: No user found",
                  requestId,
                  email: credentials.email,
                },
                null,
                2
              )
            );
            return null;
          }
          if (!user._id) {
            console.log(
              JSON.stringify(
                {
                  message: "Authorize: User document missing _id",
                  requestId,
                  user: { email: user.email, role: user.role },
                },
                null,
                2
              )
            );
            return null;
          }
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            console.log(
              JSON.stringify(
                {
                  message: "Authorize: Invalid password",
                  requestId,
                  email: credentials.email,
                },
                null,
                2
              )
            );
            return null;
          }
          const userData = {
            id: user._id.toString(),
            email: user.email,
            role: user.role || "user",
          };
          console.log(
            JSON.stringify(
              { message: "Authorize: User authenticated", requestId, userData },
              null,
              2
            )
          );
          return userData;
        } catch (error) {
          console.error(
            JSON.stringify(
              {
                message: "Authorize: Failed",
                requestId,
                error: error.message,
                stack: error.stack,
              },
              null,
              2
            )
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const requestId = Date.now().toString();
      console.log(
        JSON.stringify(
          { message: "JWT callback: Invoked", requestId, trigger, user, token },
          null,
          2
        )
      );
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.role = user.role; // Add role to token
        console.log(
          JSON.stringify(
            {
              message: "JWT callback: Set token.id, token.sub, and token.role",
              requestId,
              id: user.id,
              role: user.role,
            },
            null,
            2
          )
        );
      } else {
        console.log(
          JSON.stringify(
            { message: "JWT callback: No user provided", requestId, user },
            null,
            2
          )
        );
      }
      console.log(
        JSON.stringify(
          { message: "JWT callback: Token after update", requestId, token },
          null,
          2
        )
      );
      return token;
    },
    async session({ session, token }) {
      const requestId = Date.now().toString();
      console.log(
        JSON.stringify(
          { message: "Session callback: Invoked", requestId, token, session },
          null,
          2
        )
      );
      if (!process.env.NEXTAUTH_SECRET) {
        console.error(
          JSON.stringify(
            { message: "Session callback: NEXTAUTH_SECRET missing", requestId },
            null,
            2
          )
        );
      } else {
        console.log(
          JSON.stringify(
            { message: "Session callback: NEXTAUTH_SECRET present", requestId },
            null,
            2
          )
        );
      }
      if (token.id || token.sub) {
        session.user.id = token.id || token.sub;
        session.user.role = token.role; // Add role to session
        console.log(
          JSON.stringify(
            {
              message:
                "Session callback: Set session.user.id and session.user.role",
              requestId,
              userId: session.user.id,
              userRole: session.user.role,
            },
            null,
            2
          )
        );
      } else {
        console.log(
          JSON.stringify(
            {
              message: "Session callback: No token.id or token.sub",
              requestId,
              token,
            },
            null,
            2
          )
        );
      }
      console.log(
        JSON.stringify(
          {
            message: "Session callback: Session after update",
            requestId,
            session,
          },
          null,
          2
        )
      );
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug to avoid potential /api/auth/_log issues
};
