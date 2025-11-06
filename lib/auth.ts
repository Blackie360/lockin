import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";

import OrganizationInvitationEmail from "@/components/emails/organization-invitation";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";
import { getActiveOrganization } from "@/server/organizations";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { sendEmail } from "./email";
import { ac, admin, member, owner } from "./auth/permissions";

export const auth = betterAuth({
    baseURL: process.env.NEXT_PUBLIC_APP_URL as string,
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL as string,
        process.env.NEXT_PUBLIC_FRONTEND_URL as string,
    ].filter(Boolean) as string[],
    // Debug: log the trusted origins when auth initializes
    ...(process.env.NODE_ENV === 'development' && {
        // This will help verify CORS is configured correctly
    }),
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Verify your email",
                react: VerifyEmail({ username: user.name, verifyUrl: url }),
            });
        },
        sendOnSignUp: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                react: ForgotPasswordEmail({ username: user.name, resetUrl: url, userEmail: user.email }),
            });
        },
        requireEmailVerification: true
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    const organization = await getActiveOrganization(session.userId)
                    return {
                        data: {
                            ...session,
                            activeOrganizationId: organization?.id
                        }
                    }
                }
            }
        }
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    plugins: [organization({
        ac,
        async afterOrganizationCreate(data: { organization: { id: string }; user: { id: string } }) {
            // ensure the creating user has an activeOrganizationId set to this org
            try {
                await db.update(schema.session)
                    .set({ activeOrganizationId: data.organization.id })
                    .where(eq(schema.session.userId, data.user.id));
            } catch {}
        },
        async sendInvitationEmail(data: { 
            id: string; 
            email: string; 
            inviter: { user: { name: string; email: string } }; 
            organization: { name: string } 
        }) {
            const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${data.id}`

            await sendEmail({
                to: data.email,
                subject: "You've been invited to join our organization",
                react: OrganizationInvitationEmail({
                    email: data.email,
                    invitedByUsername: data.inviter.user.name,
                    invitedByEmail: data.inviter.user.email,
                    teamName: data.organization.name,
                    inviteLink
                })
            })
        },
        roles: {
            owner,
            admin,
            member
        },
        // Allow inviting users who don't exist yet
        requireEmailVerificationOnInvitation: false,
        invitationExpiresIn: 48 * 60 * 60, // 48 hours
        membershipLimit: 100
    }), lastLoginMethod(), nextCookies()]
});
