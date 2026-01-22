import { Resend } from 'resend';
import { withdrawalOTPTemplate, signupOTPTemplate } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'MLM ROI System <noreply@yourdomain.com>';

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
    } catch (error) {
        console.error('Failed to send signup OTP email:', error);
        throw new Error('Failed to send verification email');
    }
}
