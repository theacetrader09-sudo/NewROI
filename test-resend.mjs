// Quick test to verify Resend email is working
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    try {
        console.log('Testing Resend with API key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');

        const result = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'vishvjeet.rathore72@gmail.com', // Your test email
            subject: 'Test OTP - MLM ROI System',
            html: '<h1>Test Email</h1><p>If you receive this, Resend is working! Your OTP code would be: <strong>123456</strong></p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Email failed:');
        console.error(error);
    }
}

testEmail();
