import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

// Session duration: 30 days (extended for better UX)
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                rememberMe: { label: "Remember Me", type: "text" },
                impersonationToken: { label: "Impersonation Token", type: "text" }
            },
            async authorize(credentials) {
                // ── ADMIN IMPERSONATION PATH ────────────────────────────────
                if (credentials?.impersonationToken && credentials.email === "__impersonate__") {
                    try {
                        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
                        const { payload } = await jwtVerify(credentials.impersonationToken, secret);

                        // Payload has the target user's id, email, name, role
                        return {
                            id: payload.sub as string,
                            email: payload.email as string,
                            name: payload.name as string,
                            role: payload.role as string,
                        };
                    } catch {
                        throw new Error("Invalid or expired impersonation token");
                    }
                }

                // ── NORMAL PASSWORD LOGIN PATH ──────────────────────────────
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

                // 🔒 SECURITY: Block unverified users from logging in
                if (!user.verified) {
                    throw new Error("Please verify your email before logging in. Check your inbox for the verification code.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
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
        maxAge: SESSION_MAX_AGE,
    },
    jwt: {
        maxAge: SESSION_MAX_AGE,
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: SESSION_MAX_AGE,
            },
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
