import crypto from 'crypto';
import prisma from '@/lib/prisma';

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Create and store a new OTP for a user
 * Automatically invalidates any existing OTPs of the same type
 */
export async function createOTP(
  userId: string,
  type: 'WITHDRAWAL' | 'SIGNUP'
): Promise<string> {
  // Invalidate any existing OTPs for this user and type
  await prisma.oTP.updateMany({
    where: {
      userId,
      type,
      verified: false
    },
    data: {
      expiresAt: new Date() // Expire immediately
    }
  });

  // Generate new OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  // Store in database
  await prisma.oTP.create({
    data: {
      userId,
      code,
      type,
      expiresAt
    }
  });

  return code;
}

/**
 * Verify an OTP code for a user
 * Returns true if valid, false if invalid/expired/used
 */
export async function verifyOTP(
  userId: string,
  code: string,
  type: 'WITHDRAWAL' | 'SIGNUP'
): Promise<boolean> {
  const otp = await prisma.oTP.findFirst({
    where: {
      userId,
      code,
      type,
      verified: false,
      expiresAt: {
        gt: new Date() // Not expired
      }
    }
  });

  if (!otp) {
    return false; // Invalid, expired, or already used
  }

  // Mark as verified (one-time use)
  await prisma.oTP.update({
    where: { id: otp.id },
    data: { verified: true }
  });

  return true;
}

/**
 * Delete all expired OTPs (cleanup function - can be run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  const result = await prisma.oTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  return result.count;
}
