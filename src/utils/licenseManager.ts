// SaaS Plan & License Key Manager
// Handles Free vs Pro Lifetime (AppSumo) feature gating with 0 server costs.

export type PlanTier = 'free' | 'pro';

export interface LicenseInfo {
  tier: PlanTier;
  key?: string;
  activatedAt?: string;
  planName: string;
  source?: 'appsumo' | 'direct' | 'promo';
}

export interface PlanLimits {
  maxBooks: number;
  maxPdfPages: number;
  maxPdfImports: number;
  maxExports: number;
  hasWatermark: boolean;
  whitelabelExport: boolean;
  highResExport: boolean;
  allTemplates: boolean;
}

const STORAGE_KEY = 'flipbook_saas_license_v1';
const FREE_USAGE_KEY = 'flipbook_free_usage_tracker_v1';
const LICENSE_EVENT = 'flipbook_license_updated';
const USAGE_EVENT = 'flipbook_usage_updated';

export interface FreeUsageStats {
  pdfImportsCount: number;
  exportsCount: number;
  maxFreePdfImports: number;
  maxFreeExports: number;
}

/**
 * Get current free tier usage statistics
 */
export function getFreeUsageStats(): FreeUsageStats {
  const defaultStats: FreeUsageStats = {
    pdfImportsCount: 0,
    exportsCount: 0,
    maxFreePdfImports: 1,
    maxFreeExports: 1,
  };

  if (typeof window === 'undefined') return defaultStats;

  try {
    const raw = localStorage.getItem(FREE_USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultStats,
        pdfImportsCount: typeof parsed.pdfImportsCount === 'number' ? parsed.pdfImportsCount : 0,
        exportsCount: typeof parsed.exportsCount === 'number' ? parsed.exportsCount : 0,
      };
    }
  } catch (e) {
    // fallback
  }

  return defaultStats;
}

/**
 * Checks if PDF import is allowed under the current plan
 */
export function canImportPdf(): { allowed: boolean; count: number; max: number; reason?: string } {
  const license = getLicenseInfo();
  if (license.tier === 'pro') {
    return { allowed: true, count: 0, max: 9999 };
  }
  const stats = getFreeUsageStats();
  if (stats.pdfImportsCount >= stats.maxFreePdfImports) {
    return {
      allowed: false,
      count: stats.pdfImportsCount,
      max: stats.maxFreePdfImports,
      reason: 'Free Starter plan limit reached: You have used your 1 free PDF import. Upgrade to Pro for unlimited PDF conversions.',
    };
  }
  return { allowed: true, count: stats.pdfImportsCount, max: stats.maxFreePdfImports };
}

/**
 * Records a successful PDF import for free tier tracking
 */
export function recordPdfImport(): void {
  const license = getLicenseInfo();
  if (license.tier === 'pro') return;
  const stats = getFreeUsageStats();
  stats.pdfImportsCount += 1;
  try {
    localStorage.setItem(FREE_USAGE_KEY, JSON.stringify(stats));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(USAGE_EVENT, { detail: stats }));
    }
  } catch (e) {}
}

/**
 * Checks if HTML export is allowed under the current plan
 */
export function canExportHtml(): { allowed: boolean; count: number; max: number; reason?: string } {
  const license = getLicenseInfo();
  if (license.tier === 'pro') {
    return { allowed: true, count: 0, max: 9999 };
  }
  const stats = getFreeUsageStats();
  if (stats.exportsCount >= stats.maxFreeExports) {
    return {
      allowed: false,
      count: stats.exportsCount,
      max: stats.maxFreeExports,
      reason: 'Free Starter plan limit reached: You have already used your 1 free book export (HTML or PDF). Upgrade to Pro for unlimited white-label exports.',
    };
  }
  return { allowed: true, count: stats.exportsCount, max: stats.maxFreeExports };
}

/**
 * Records an HTML or PDF export for free tier tracking
 */
export function recordExportHtml(): void {
  const license = getLicenseInfo();
  if (license.tier === 'pro') return;
  const stats = getFreeUsageStats();
  stats.exportsCount += 1;
  try {
    localStorage.setItem(FREE_USAGE_KEY, JSON.stringify(stats));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(USAGE_EVENT, { detail: stats }));
    }
  } catch (e) {}
}

/**
 * Subscribe to free usage stats updates
 */
export function onUsageChange(callback: (stats: FreeUsageStats) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: any) => {
    callback(e.detail || getFreeUsageStats());
  };

  window.addEventListener(USAGE_EVENT, handler);
  return () => window.removeEventListener(USAGE_EVENT, handler);
}

// Secret Owner Key & Authorized VIP codes
const RECOGNIZED_VIP_CODES = [
  'TABREJ-OWNER-9999',
  'APPSUMO-LIFETIME-VIP',
  'FLIPBOOK-LTD-MASTER',
];

// Block obvious placeholder / example keys shown in UI or guessed by users
const BLOCKED_EXAMPLE_KEYS = new Set([
  'A1B2C3D4-E5F6-7890-ABCD-1234567890EF',
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  '12345678-1234-1234-1234-123456789012',
  'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA',
  'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
]);

export const GUMROAD_CHECKOUT_URL = 'https://tabrej6.gumroad.com/l/3d-flipbook-pro';
export const GUMROAD_PRODUCT_PERMALINK = '3d-flipbook-pro';

/**
 * Validates whether a key is the Secret Owner Key, a valid Gumroad UUID key, or an AppSumo voucher
 */
export function validateLicenseFormat(rawKey: string): { isValid: boolean; source: 'appsumo' | 'direct' | 'promo'; cleanKey: string; errorReason?: string } {
  const cleanKey = rawKey.trim().toUpperCase();

  if (!cleanKey) {
    return { isValid: false, source: 'direct', cleanKey, errorReason: 'Please enter a license key.' };
  }

  if (BLOCKED_EXAMPLE_KEYS.has(cleanKey)) {
    return {
      isValid: false,
      source: 'direct',
      cleanKey,
      errorReason: 'This is a sample placeholder key. Please enter your actual Gumroad purchase key.',
    };
  }

  // 1. Check Secret Owner Key & VIP codes
  if (RECOGNIZED_VIP_CODES.includes(cleanKey)) {
    return { isValid: true, source: 'promo', cleanKey };
  }

  // 2. Standard Gumroad hexadecimal UUID license format (8-4-4-4-12 hex digits)
  const hexUuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/;
  if (hexUuidPattern.test(cleanKey)) {
    // Reject low-entropy fake keys (e.g. fewer than 6 unique characters)
    const uniqueChars = new Set(cleanKey.replace(/-/g, '').split('')).size;
    if (uniqueChars < 6) {
      return {
        isValid: false,
        source: 'direct',
        cleanKey,
        errorReason: 'Invalid Gumroad license key signature.',
      };
    }
    return { isValid: true, source: 'direct', cleanKey };
  }

  // 3. Gumroad 4-segment hexadecimal license format (e.g., XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)
  const gumroadFourSegment = /^[0-9A-F]{8}(-[0-9A-F]{8}){3}$/;
  if (gumroadFourSegment.test(cleanKey)) {
    const uniqueChars = new Set(cleanKey.replace(/-/g, '').split('')).size;
    if (uniqueChars < 6) {
      return {
        isValid: false,
        source: 'direct',
        cleanKey,
        errorReason: 'Invalid Gumroad license key signature.',
      };
    }
    return { isValid: true, source: 'direct', cleanKey };
  }

  // 4. Check AppSumo Prefix code (AS-XXXX-XXXX-XXXX)
  if (/^AS-[A-Z0-9]{4,8}(-[A-Z0-9]{4,8}){2,3}$/.test(cleanKey)) {
    return { isValid: true, source: 'appsumo', cleanKey };
  }

  return {
    isValid: false,
    source: 'direct',
    cleanKey,
    errorReason: 'Invalid license key format. Please copy the exact 36-character key from your Gumroad receipt.',
  };
}

/**
 * Verifies a license key against Gumroad's Official License Verification API
 * while always allowing the Secret Owner Key (TABREJ-OWNER-9999) immediately.
 */
export async function verifyAndActivateLicenseAsync(
  rawKey: string
): Promise<{ success: boolean; message: string; info?: LicenseInfo }> {
  const check = validateLicenseFormat(rawKey);
  if (!check.isValid) {
    return {
      success: false,
      message: check.errorReason || 'Invalid license key format. Please check your Gumroad receipt.',
    };
  }

  // Secret Owner Key & VIP codes bypass remote API check immediately
  if (RECOGNIZED_VIP_CODES.includes(check.cleanKey)) {
    return activateLicense(check.cleanKey);
  }

  // Verify with Gumroad v2 License API
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_permalink: GUMROAD_PRODUCT_PERMALINK,
        license_key: check.cleanKey,
        increment_uses_count: 'true',
      }).toString(),
    });

    const data = await response.json().catch(() => null);

    if (data && data.success === true) {
      if (data.purchase?.refunded || data.purchase?.chargebacked) {
        return {
          success: false,
          message: 'This license key has been refunded or cancelled.',
        };
      }
      return activateLicense(check.cleanKey);
    }

    // If Gumroad explicitly says the license key does not exist for a live product
    if (data && data.success === false && data.message && !data.message.toLowerCase().includes('product')) {
      return {
        success: false,
        message: 'License key not found on Gumroad. Please check your purchase receipt or buy a Pro Lifetime key.',
      };
    }
  } catch (networkErr) {
    // Offline fallback if browser blocks third-party call or user is offline
  }

  return activateLicense(check.cleanKey);
}

/**
 * Get current active license status from local storage
 */
export function getLicenseInfo(): LicenseInfo {
  if (typeof window === 'undefined') {
    return { tier: 'free', planName: 'Free Starter' };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { tier: 'free', planName: 'Free Starter' };
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.tier === 'pro') {
      return {
        tier: 'pro',
        key: parsed.key,
        activatedAt: parsed.activatedAt,
        planName:
          parsed.key === 'TABREJ-OWNER-9999'
            ? 'Owner Master License'
            : parsed.source === 'appsumo'
            ? 'AppSumo Pro Lifetime'
            : 'Pro Lifetime License',
        source: parsed.source || 'direct',
      };
    }
  } catch (e) {
    // Fallback to free if corrupted
  }

  return { tier: 'free', planName: 'Free Starter' };
}

/**
 * Validates and activates a license key
 */
export function activateLicense(rawKey: string): { success: boolean; message: string; info?: LicenseInfo } {
  const check = validateLicenseFormat(rawKey);

  if (!check.isValid) {
    return {
      success: false,
      message: check.errorReason || 'Invalid code format. Please check your Gumroad license key.',
    };
  }

  const info: LicenseInfo = {
    tier: 'pro',
    key: check.cleanKey,
    activatedAt: new Date().toISOString(),
    planName:
      check.cleanKey === 'TABREJ-OWNER-9999'
        ? 'Owner Master License'
        : check.source === 'appsumo'
        ? 'AppSumo Pro Lifetime'
        : 'Pro Lifetime License',
    source: check.source,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    // Dispatch event for instant reactive UI updates
    window.dispatchEvent(new CustomEvent(LICENSE_EVENT, { detail: info }));
    return {
      success: true,
      message: `Congratulations! ${info.planName} successfully activated.`,
      info,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Could not save license locally. Please check browser storage settings.',
    };
  }
}

/**
 * Deactivates license and returns to Free tier
 */
export function deactivateLicense(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(LICENSE_EVENT, {
      detail: { tier: 'free', planName: 'Free Starter' },
    })
  );
}

/**
 * Plan Feature Limits
 */
export function getPlanLimits(tier?: PlanTier): PlanLimits {
  const currentTier = tier || getLicenseInfo().tier;

  if (currentTier === 'pro') {
    return {
      maxBooks: 9999,
      maxPdfPages: 150, // Optimal for browser canvas memory
      maxPdfImports: 9999, // Unlimited
      maxExports: 9999, // Unlimited
      hasWatermark: false,
      whitelabelExport: true,
      highResExport: true,
      allTemplates: true,
    };
  }

  return {
    maxBooks: 3,
    maxPdfPages: 15, // Free tier limit to protect memory and drive conversions
    maxPdfImports: 1, // Only 1 free PDF import
    maxExports: 1, // Only 1 free HTML export
    hasWatermark: true,
    whitelabelExport: false,
    highResExport: false,
    allTemplates: true,
  };
}

/**
 * Subscribe to license updates
 */
export function onLicenseChange(callback: (info: LicenseInfo) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: any) => {
    callback(e.detail || getLicenseInfo());
  };

  window.addEventListener(LICENSE_EVENT, handler);
  return () => window.removeEventListener(LICENSE_EVENT, handler);
}
