import { Resend } from 'resend';
import { withdrawalOTPTemplate, signupOTPTemplate } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.FROM_EMAIL) {
    throw new Error('FROM_EMAIL environment variable is not set. Please configure it in Vercel.');
}

const FROM_EMAIL = process.env.FROM_EMAIL;

/**
 * Send withdrawal OTP verification email
 */
export async function sendWithdrawalOTP(
    email: string,
    userName: string,
    otp: string,
    amount: number
): Promise<void> {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `🔒 Your Withdrawal Verification Code: ${otp}`,
            html: withdrawalOTPTemplate(otp, amount, userName)
        });
        console.log(`✅ Withdrawal OTP sent to ${email}`);
    } catch (error) {
        console.error('Failed to send withdrawal OTP email:', error);
        throw new Error('Failed to send verification email');
    }
}

/**
 * Send signup email verification OTP
 */
export async function sendSignupOTP(
    email: string,
    userName: string,
    otp: string
): Promise<void> {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `🎉 Verify your email - Code: ${otp}`,
            html: signupOTPTemplate(otp, userName)
        });
        console.log(`✅ Signup OTP sent to ${email}`);
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        throw new Error("Failed to send verification email");
    }
}

// ========================================
// ADMIN NOTIFICATIONS
// ========================================

export async function sendAdminDepositNotification(
    userEmail: string,
    userName: string,
    amount: number,
    txid: string
) {
    if (!process.env.ADMIN_EMAIL) {
        console.warn("ADMIN_EMAIL not configured - skipping notification");
        return;
    }

    try {
        await resend.emails.send({
            from: process.env.FROM_EMAIL || "noreply@mlmroi.com",
            to: process.env.ADMIN_EMAIL,
            subject: `🔔 New Deposit Submitted - ${userName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0b10; color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #8B5CF6, #C084FC); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; color: white; font-size: 28px;">💰 New Deposit Pending</h1>
                    </div>
                    
                    <div style="background-color: #161821; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                        <h2 style="color: #C084FC; margin-top: 0;">Deposit Details</h2>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #0a0b10; border-radius: 8px;">
                            <p style="margin: 10px 0;"><strong style="color: #C084FC;">User:</strong> ${userName}</p>
                            <p style="margin: 10px 0;"><strong style="color: #C084FC;">Email:</strong> ${userEmail}</p>
                            <p style="margin: 10px 0;"><strong style="color: #C084FC;">Amount:</strong> $${amount.toFixed(2)} USDT</p>
                            <p style="margin: 10px 0; word-break: break-all;"><strong style="color: #C084FC;">TXID:</strong> ${txid}</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(192, 132, 252, 0.2)); border-radius: 8px; border-left: 4px solid #8B5CF6;">
                            <p style="margin: 0; color: #ffffff;"><strong>⚡ Action Required:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #94a3b8;">Please verify the transaction on BSCScan and approve or reject in the admin panel.</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
                               style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                Go to Admin Panel
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #64748b; font-size: 12px; margin-top: 20px;">
                        <p>This is an automated notification from MLM ROI System</p>
                    </div>
                </div>
            `,
        });
        console.log("✅ Admin deposit notification sent to:", process.env.ADMIN_EMAIL);
    } catch (error) {
        console.error("Failed to send admin deposit notification:", error);
        // Don't throw - notification failure shouldn't block deposit submission
    }
}

export async function sendAdminWithdrawalNotification(
    userEmail: string,
    userName: string,
    amount: number,
    netAmount: number,
    walletAddress: string
) {
    if (!process.env.ADMIN_EMAIL) {
        console.warn("ADMIN_EMAIL not configured - skipping notification");
        return;
    }

    try {
        await resend.emails.send({
            from: process.env.FROM_EMAIL || "noreply@mlmroi.com",
            to: process.env.ADMIN_EMAIL,
            subject: `🔔 New Withdrawal Request - ${userName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0b10; color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #8B5CF6, #C084FC); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; color: white; font-size: 28px;">💸 New Withdrawal Request</h1>
                    </div>
                    
                    <div style="background-color: #161821; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                        <h2 style="color: #C084FC; margin-top: 0;">Withdrawal Details</h2>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #0a0b10; border-radius: 8px;">
                            <p style="margin: 10px 0;"><strong style="color: #C084FC;">User:</strong> ${userName}</p>
                            <p style="margin: 10px 0;"><strong style="color: #C084FC;">Email:</strong> ${userEmail}</p>
                            <p style="margin: 10px 0;"><strong style="color: #C084FC;">Requested Amount:</strong> $${amount.toFixed(2)}</p>
                            <p style="margin: 10px 0;"><strong style="color: #10b981;">Net Payout:</strong> $${netAmount.toFixed(2)} USDT</p>
                            <p style="margin: 10px 0; word-break: break-all;"><strong style="color: #C084FC;">Wallet Address:</strong></p>
                            <p style="margin: 5px 0; font-family: monospace; font-size: 12px; background-color: #0a0b10; padding: 10px; border-radius: 4px;">${walletAddress}</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(251, 191, 36, 0.2)); border-radius: 8px; border-left: 4px solid #ef4444;">
                            <p style="margin: 0; color: #ffffff;"><strong>⚡ Action Required:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #94a3b8;">Please process the withdrawal and update the status in the admin panel.</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
                               style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                Go to Admin Panel
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #64748b; font-size: 12px; margin-top: 20px;">
                        <p>This is an automated notification from MLM ROI System</p>
                    </div>
                </div>
            `,
        });
        console.log("✅ Admin withdrawal notification sent to:", process.env.ADMIN_EMAIL);
    } catch (error) {
        console.error("Failed to send admin withdrawal notification:", error);
        // Don't throw - notification failure shouldn't block withdrawal submission
    }
}
