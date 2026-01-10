import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Session duration: 7 days default, 30 days if "remember me"
const DEFAULT_SESSION_DAYS = 7;
const REMEMBER_ME_DAYS = 30;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                rememberMe: { label: "Remember Me", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                // Normalize email to lowercase for case-insensitive login
                const normalizedEmail = credentials.email.toLowerCase().trim();

                const user = await prisma.user.findUnique({
                    where: { email: normalizedEmail }
                });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    rememberMe: credentials.rememberMe === "true"
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.rememberMe = (user as any).rememberMe;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: DEFAULT_SESSION_DAYS * 24 * 60 * 60, // 7 days in seconds
    },
    jwt: {
        maxAge: REMEMBER_ME_DAYS * 24 * 60 * 60, // 30 days max for JWT
    },
    secret: process.env.NEXTAUTH_SECRET,
};
