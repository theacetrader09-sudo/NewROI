/**
 * BscScan API utility for verifying transactions on BSC network
 */

const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";
const BSCSCAN_BASE_URL = "https://api.bscscan.com/api";

// USDT BEP20 Contract Address on BSC
const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955".toLowerCase();

// Minimum confirmations required for a transaction to be considered valid
const MIN_CONFIRMATIONS = 12;

interface VerificationResult {
    valid: boolean;
    amount?: number;
    recipient?: string;
    sender?: string;
    confirmations?: number;
    error?: string;
}

/**
 * Verify a USDT BEP20 transaction on BSC
 * @param txHash - The transaction hash to verify
 * @param expectedRecipient - The expected recipient address (your deposit address)
 * @param minAmount - Minimum expected amount in USD
 */
export async function verifyTransaction(
    txHash: string,
    expectedRecipient: string,
    minAmount: number
): Promise<VerificationResult> {
    try {
        if (!BSCSCAN_API_KEY) {
            console.warn("BSCSCAN_API_KEY not set, skipping auto-verification");
            return { valid: false, error: "Auto-verification not configured" };
        }

        // Clean up the inputs
        txHash = txHash.trim();
        expectedRecipient = expectedRecipient.toLowerCase();

        // Step 1: Get transaction receipt to check if it's successful
        const receiptUrl = `${BSCSCAN_BASE_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`;
        const receiptRes = await fetch(receiptUrl);
        const receiptData = await receiptRes.json();

        if (!receiptData.result || receiptData.result === null) {
            return { valid: false, error: "Transaction not found or still pending" };
        }

        const receipt = receiptData.result;

        // Check if transaction was successful (status = 0x1)
        if (receipt.status !== "0x1") {
            return { valid: false, error: "Transaction failed on blockchain" };
        }

        // Step 2: Get token transfers for this transaction
        const tokenTxUrl = `${BSCSCAN_BASE_URL}?module=account&action=tokentx&contractaddress=${USDT_CONTRACT}&address=${expectedRecipient}&page=1&offset=100&sort=desc&apikey=${BSCSCAN_API_KEY}`;
        const tokenRes = await fetch(tokenTxUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.status !== "1" || !tokenData.result) {
            return { valid: false, error: "Could not fetch token transfers" };
        }

        // Find the specific transaction
        const transfer = tokenData.result.find(
            (tx: any) => tx.hash.toLowerCase() === txHash.toLowerCase()
        );

        if (!transfer) {
            return {
                valid: false,
                error: "No USDT transfer found to this address in this transaction"
            };
        }

        // Verify recipient
        if (transfer.to.toLowerCase() !== expectedRecipient) {
            return {
                valid: false,
                error: `Recipient mismatch. Expected: ${expectedRecipient}, Got: ${transfer.to}`
            };
        }

        // Calculate amount (USDT has 18 decimals on BSC)
        const transferAmount = parseFloat(transfer.value) / 1e18;

        // Verify amount
        if (transferAmount < minAmount) {
            return {
                valid: false,
                error: `Amount too low. Expected: $${minAmount}, Got: $${transferAmount.toFixed(2)}`
            };
        }

        // Check confirmations
        const currentBlockUrl = `${BSCSCAN_BASE_URL}?module=proxy&action=eth_blockNumber&apikey=${BSCSCAN_API_KEY}`;
        const blockRes = await fetch(currentBlockUrl);
        const blockData = await blockRes.json();

        const currentBlock = parseInt(blockData.result, 16);
        const txBlock = parseInt(transfer.blockNumber);
        const confirmations = currentBlock - txBlock;

        if (confirmations < MIN_CONFIRMATIONS) {
            return {
                valid: false,
                error: `Insufficient confirmations. Required: ${MIN_CONFIRMATIONS}, Got: ${confirmations}. Please wait a few minutes.`
            };
        }

        // All checks passed!
        return {
            valid: true,
            amount: transferAmount,
            recipient: transfer.to,
            sender: transfer.from,
            confirmations: confirmations
        };

    } catch (error: any) {
        console.error("BscScan verification error:", error);
        return {
            valid: false,
            error: `Verification failed: ${error.message}`
        };
    }
}

/**
 * Simple check if a transaction hash is valid format
 */
export function isValidTxHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash.trim());
}
