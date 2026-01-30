import { NextResponse } from "next/server";

/**
 * Send Telegram notification to admin
 * Non-blocking - won't fail deposit/withdrawal if notification fails
 */
export async function sendTelegramNotification(message: string): Promise<boolean> {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

        if (!token || !chatId) {
            console.warn('[TELEGRAM] Bot token or chat ID not configured');
            return false;
        }

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        if (!response.ok) {
            console.error('[TELEGRAM] Failed to send notification:', await response.text());
            return false;
        }

        console.log('[TELEGRAM] Notification sent successfully');
        return true;
    } catch (error) {
        console.error('[TELEGRAM] Error sending notification:', error);
        return false;
    }
}

/**
 * Send deposit notification to admin via Telegram
 * User never sees this - completely backend notification
 */
export async function sendDepositNotification(
    userEmail: string,
    userName: string,
    amount: number,
    txid: string
): Promise<void> {
    const adminPanelUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://new-roi.vercel.app';

    const message = `
🆕 <b>New Deposit Submitted</b>

👤 <b>User:</b> ${userName}
📧 <b>Email:</b> ${userEmail}
💰 <b>Amount:</b> $${amount.toFixed(2)}
🔖 <b>TXID:</b> ${txid}

🕒 <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

<b>⚡ Action Required:</b>
<a href="${adminPanelUrl}/admin/deposits">Approve in Admin Panel →</a>

💡 <i>User sees: "Processing deposit - funds will be added within minutes"</i>
`.trim();

    // Non-blocking - don't wait for result
    sendTelegramNotification(message).catch(err =>
        console.error('Failed to send Telegram deposit notification:', err)
    );
}

/**
 * Send withdrawal notification to admin via Telegram
 * User never sees this - completely backend notification
 */
export async function sendWithdrawalNotification(
    userEmail: string,
    userName: string,
    amount: number,
    netPayout: number,
    walletAddress: string
): Promise<void> {
    const adminPanelUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://new-roi.vercel.app';
    const fee = amount - netPayout;

    const message = `
💸 <b>New Withdrawal Request</b>

👤 <b>User:</b> ${userName}
📧 <b>Email:</b> ${userEmail}
💰 <b>Amount:</b> $${amount.toFixed(2)}
💳 <b>Net Payout:</b> $${netPayout.toFixed(2)} <i>(5% fee: $${fee.toFixed(2)})</i>
🏦 <b>Wallet:</b> <code>${walletAddress}</code>

🕒 <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

<b>⚡ Action Required:</b>
<a href="${adminPanelUrl}/admin/withdrawals">Process in Admin Panel →</a>

💡 <i>User sees: "Withdrawal request being processed - typically processed within 24 hours"</i>
`.trim();

    // Non-blocking - don't wait for result
    sendTelegramNotification(message).catch(err =>
        console.error('Failed to send Telegram withdrawal notification:', err)
    );
}
