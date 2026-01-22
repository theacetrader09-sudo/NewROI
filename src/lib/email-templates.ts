/**
 * Email template for withdrawal OTP verification
 */
export const withdrawalOTPTemplate = (otp: string, amount: number, userName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Withdrawal Verification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 16px; color: #1d1d1f; margin-bottom: 20px; }
    .message { font-size: 15px; color: #424245; line-height: 1.6; margin-bottom: 30px; }
    .otp-box { background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fb 100%); border: 3px solid #667eea; border-radius: 16px; padding: 40px 20px; text-align: center; margin: 30px 0; }
    .otp-label { font-size: 14px; color: #86868b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
    .otp-code { font-size: 52px; font-weight: 700; color: #667eea; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.1); }
    .otp-expiry { font-size: 13px; color: #86868b; margin-top: 15px; }
    .amount-box { background: #f5f5f7; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
    .amount-label { font-size: 13px; color: #86868b; margin-bottom: 8px; }
    .amount-value { font-size: 32px; font-weight: 700; color: #1d1d1f; }
    .security-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px 20px; border-radius: 8px; margin: 25px 0; }
    .security-notice strong { color: #856404; display: block; margin-bottom: 8px; }
    .security-notice p { font-size: 14px; color: #856404; line-height: 1.5; }
    .footer { background: #f5f5f7; padding: 30px; text-align: center; }
    .footer p { font-size: 13px; color: #86868b; line-height: 1.6; }
    .divider { height: 1px; background: #e5e5ea; margin: 30px 0; }
    @media (max-width: 600px) {
      .otp-code { font-size: 42px; letter-spacing: 8px; }
      .amount-value { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Withdrawal Verification</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${userName},</div>
      
      <div class="message">
        You have requested to withdraw funds from your account. For your security, please verify this transaction with the One-Time Password below.
      </div>

      <div class="amount-box">
        <div class="amount-label">Withdrawal Amount</div>
        <div class="amount-value">$${amount.toFixed(2)}</div>
      </div>
      
      <div class="otp-box">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏱ Valid for 5 minutes only</div>
      </div>
      
      <div class="security-notice">
        <strong>🛡️ Security Notice</strong>
        <p>Never share this code with anyone, including our support team. We will never ask for your OTP. If you didn't request this withdrawal, please secure your account immediately.</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="message" style="font-size: 14px; color: #86868b;">
        This is an automated security message. Please do not reply to this email.
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} MLM ROI System. All rights reserved.</p>
      <p style="margin-top: 10px;">Secure transactions powered by advanced verification</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Email template for signup email verification
 */
export const signupOTPTemplate = (otp: string, userName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 20px; text-align: center; }
    .header-icon { font-size: 64px; margin-bottom: 15px; }
    .header h1 { color: white; font-size: 32px; font-weight: 600; margin-bottom: 10px; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1d1d1f; font-weight: 600; margin-bottom: 20px; }
    .message { font-size: 15px; color: #424245; line-height: 1.7; margin-bottom: 30px; }
    .otp-box { background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); border: 3px solid #4caf50; border-radius: 16px; padding: 40px 20px; text-align: center; margin: 30px 0; }
    .otp-label { font-size: 14px; color: #66bb6a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; font-weight: 600; }
    .otp-code { font-size: 52px; font-weight: 700; color: #2e7d32; letter-spacing: 12px; font-family: 'Courier New', monospace; }
    .otp-expiry { font-size: 13px; color: #66bb6a; margin-top: 15px; }
    .welcome-box { background: linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%); border-radius: 12px; padding: 25px; margin: 25px 0; }
    .welcome-box h3 { font-size: 18px; color: #0277bd; margin-bottom: 15px; }
    .welcome-box ul { list-style: none; padding: 0; }
    .welcome-box li { font-size: 14px; color: #01579b; padding: 8px 0; padding-left: 30px; position: relative; }
    .welcome-box li:before { content: '✓'; position: absolute; left: 0; color: #4caf50; font-weight: bold; font-size: 18px; }
    .footer { background: #f5f5f7; padding: 30px; text-align: center; }
    .footer p { font-size: 13px; color: #86868b; line-height: 1.6; }
    .divider { height: 1px; background: #e5e5ea; margin: 30px 0; }
    @media (max-width: 600px) {
      .otp-code { font-size: 42px; letter-spacing: 8px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">🎉</div>
      <h1>Welcome to MLM ROI!</h1>
      <p>You're just one step away</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${userName}!</div>
      
      <div class="message">
        Thank you for joining MLM ROI System! We're excited to have you on board. To complete your registration and start earning, please verify your email address with the code below:
      </div>
      
      <div class="otp-box">
        <div class="otp-label">Email Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏱ Expires in 5 minutes</div>
      </div>
      
      <div class="welcome-box">
        <h3>✨ What's waiting for you:</h3>
        <ul>
          <li>Activate investment packages and earn 1% daily ROI</li>
          <li>Refer friends and earn from 10-level commission system</li>
          <li>Track your earnings in real-time dashboard</li>
          <li>Withdraw your profits securely anytime</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <div class="message" style="font-size: 14px; color: #86868b;">
        If you didn't create this account, you can safely ignore this email.
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Need help?</strong> Contact our support team</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} MLM ROI System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
