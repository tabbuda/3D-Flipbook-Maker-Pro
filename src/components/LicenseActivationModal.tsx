import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Key,
  ShieldCheck,
  Zap,
  Crown,
  FileCheck,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import {
  LicenseInfo,
  getLicenseInfo,
  verifyAndActivateLicenseAsync,
  deactivateLicense,
  getPlanLimits,
  GUMROAD_CHECKOUT_URL,
} from '../utils/licenseManager';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [license, setLicense] = useState<LicenseInfo>(() => getLicenseInfo());
  const [inputKey, setInputKey] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isPro = license.tier === 'pro';
  const limits = getPlanLimits(license.tier);

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputKey.trim()) {
      setStatusMessage({ text: 'Please enter your Gumroad license key or voucher code.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await verifyAndActivateLicenseAsync(inputKey);
    setIsSubmitting(false);

    if (res.success && res.info) {
      setLicense(res.info);
      setStatusMessage({ text: res.message, isError: false });
      setInputKey('');
      if (onSuccess) onSuccess();
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  const handleDeactivate = () => {
    if (confirm('Are you sure you want to deactivate your Pro License on this device?')) {
      deactivateLicense();
      setLicense(getLicenseInfo());
      setStatusMessage({ text: 'Switched back to Free Starter tier.', isError: false });
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-5 sm:p-6 overflow-hidden shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 p-0.5 shadow-lg shadow-emerald-900/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {isPro ? 'Pro Lifetime Active' : 'Upgrade to Pro Lifetime'}
                </h2>
                {isPro ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wide">
                    VIP
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide">
                    EARLY BIRD LTD
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {isPro
                  ? 'Unlimited publications, 150-page PDF conversion & 100% white-label exports'
                  : 'Pay once, own forever — Zero monthly fees or cloud lock-in'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Active Pro Banner */}
          {isPro ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      License Status
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700">
                      {license.planName}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-extrabold text-slate-900 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                    {license.key || 'ACTIVE-PRO-LICENSE'}
                  </div>
                  {license.activatedAt && (
                    <p className="text-[11px] text-emerald-700 mt-1.5">
                      Activated on: {new Date(license.activatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Activation Form */
            <form onSubmit={handleActivate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-750 uppercase tracking-wider mb-1.5">
                  Enter Gumroad License Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value.toUpperCase());
                      setStatusMessage(null);
                    }}
                    placeholder="Paste your 36-digit Gumroad license key..."
                    className="w-full pl-9 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all uppercase"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !inputKey.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  >
                    {isSubmitting ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <span>Verify</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Paste the license key sent to your email receipt after purchasing on Gumroad.
                </p>
              </div>

              {/* Status feedback */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    statusMessage.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}
                >
                  {statusMessage.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Direct Gumroad Checkout CTA */}
              <div className="pt-1">
                <a
                  href={GUMROAD_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>Get Pro Lifetime Deal ($19 Early Bird) on Gumroad</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <p className="text-[10px] text-center text-slate-500 mt-1">
                  ⚡ Regular $29 • Instant license key delivery right after checkout via email & receipt.
                </p>
              </div>
            </form>
          )}

          {/* Plan Features Comparison Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Plan Capabilities</span>
              <div className="flex items-center gap-4">
                <span className="w-16 text-center text-slate-500">Free</span>
                <span className="w-24 text-center text-emerald-700 font-extrabold">Pro Lifetime</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Active Bookshelf Projects</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center text-slate-500 font-mono">Up to 3</span>
                  <span className="w-24 text-center text-emerald-700 font-bold font-mono">Unlimited ∞</span>
                </div>
              </div>

              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
                <span className="text-slate-700 font-medium">PDF Document Imports</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center text-amber-700 font-bold font-mono">1 PDF Only</span>
                  <span className="w-24 text-center text-emerald-700 font-bold font-mono">Unlimited ∞</span>
                </div>
              </div>

              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Pages Per PDF File</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center text-slate-500 font-mono">15 Pages</span>
                  <span className="w-24 text-center text-emerald-700 font-bold font-mono">150 Pages</span>
                </div>
              </div>

              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
                <span className="text-slate-700 font-medium">Book Exports (.HTML & Vector .PDF)</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center text-amber-700 font-bold font-mono">1 Export Only</span>
                  <span className="w-24 text-center text-emerald-700 font-bold font-mono">Unlimited ∞</span>
                </div>
              </div>

              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Whitelabel (Remove Branding Badge)</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center text-slate-400">Watermarked</span>
                  <span className="w-24 text-center text-emerald-700 font-bold">100% Clean</span>
                </div>
              </div>

              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
                <span className="text-slate-700 font-medium">Custom Brand Logo & Website Link</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center text-slate-400">Locked</span>
                  <span className="w-24 text-center text-emerald-700 font-bold">Included ✓</span>
                </div>
              </div>

              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Website Embed & QR Generator</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center text-emerald-600 font-bold">Included</span>
                  <span className="w-24 text-center text-emerald-700 font-bold">Commercial ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Reassurance & Help note */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Private & Zero Server Quotas:</strong> All publication conversions and high-res rendering occur locally inside your browser. No monthly storage fees, subscription traps, or data tracking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {isPro ? (
            <button
              onClick={handleDeactivate}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
            >
              Deactivate / Change Code
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              Purchased on AppSumo? Enter code above.
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            {isPro ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
