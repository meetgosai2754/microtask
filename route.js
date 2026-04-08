import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Find user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        // Gamification: Daily Login Detection
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let loginBonus = 0;
        if (!user.lastLoginDate || new Date(user.lastLoginDate) < startOfToday) {
          loginBonus = 50; // Daily reward!
          
          user = await prisma.user.update({
            where: { id: user.id },
            data: { 
              points: { increment: loginBonus },
              lifetimePoints: { increment: loginBonus },
              lastLoginDate: now
            }
          });
          console.log(`[GAMIFICATION] Granted +50 daily login points to ${user.email}`);
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          points: user.points,
          lifetimePoints: user.lifetimePoints
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.points = user.points;
        token.lifetimePoints = user.lifetimePoints;
      }
      
      // Update points if triggered via client context
      if (trigger === "update" && session?.points !== undefined) {
        token.points = session.points;
      }
      if (trigger === "update" && session?.lifetimePoints !== undefined) {
        token.lifetimePoints = session.lifetimePoints;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.points = token.points;
        session.user.lifetimePoints = token.lifetimePoints;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
