import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" },
        isLogin: { label: "isLogin", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { email, password, isLogin } = credentials;
        const ADMIN_EMAIL = "akhilrwt2004@gmail.com";
        const ADMIN_PWD = "Akhil@gehu0912";

        if (isLogin === 'false') {
          // Registration flow
          let finalRole = "USER";
          if (email === ADMIN_EMAIL) {
            if (password !== ADMIN_PWD) throw new Error("Invalid admin setup credentials.");
            finalRole = "ADMIN";
          }

          const existingUser = await prisma.user.findUnique({ where: { email } });
          if (existingUser) throw new Error("Email already registered");
          
          const passwordHash = await bcrypt.hash(password, 10);
          const newUser = await prisma.user.create({
            data: { email, passwordHash, name: email.split('@')[0], role: finalRole }
          });
          return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
        } else {
          // Login flow
          let user = await prisma.user.findUnique({ where: { email } });
          
          // Auto-migrate the admin if they try to login before registration
          if (!user && email === ADMIN_EMAIL && password === ADMIN_PWD) {
            const passwordHash = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
              data: { email, passwordHash, name: "Admin", role: "ADMIN" }
            });
            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }

          if (!user) throw new Error("No user found");

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) throw new Error("Incorrect password");
          
          // Ensure role matches requirements
          if (email === ADMIN_EMAIL && user.role !== "ADMIN") {
            user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
          } else if (email !== ADMIN_EMAIL && user.role === "ADMIN") {
            // Prevent others from being admin
            user = await prisma.user.update({ where: { email }, data: { role: "USER" } });
          }

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth",
  }
};
