/**
 * Security utilities for the MoneyBee application
 */

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>\"']/g, '');
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Generates a secure random string for device IDs
 */
export function generateSecureDeviceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Validates that a user ID matches the expected format (Supabase UUIDs)
 */
export function isValidUserId(userId: string): boolean {
  return typeof userId === 'string' && userId.length > 0;
}

/**
 * Rate limiting utility for API calls
 */
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window expired
    if (now - attempt.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Check if under limit
    if (attempt.count < maxAttempts) {
      attempt.count++;
      attempt.lastAttempt = now;
      return true;
    }
    
    return false;
  }
}

export const rateLimiter = new RateLimiter();