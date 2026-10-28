import React from 'react';
import {
  Smartphone,
  Monitor,
  Apple,
  Download,
  CheckCircle2,
  X,
  Share,
  PlusSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'other';
  onPromptInstall: () => Promise<'accepted' | 'dismissed' | null | undefined>;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  platform,
  onPromptInstall,
}) => {
  const [activeTab, setActiveTab] = React.useState<'android' | 'desktop' | 'ios'>(
    platform === 'ios' ? 'ios' : platform === 'desktop' ? 'desktop' : 'android'
  );

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await onPromptInstall();
      if (outcome === 'accepted') {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 text-slate-800">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Install Flipbook WebApp
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Run as a standalone app on Mobile & PC without browser URL bar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Quick Install Banner (When browser native prompt is available) */}
          {isInstallable && !isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-bold text-slate-900">One-Click Direct Install Ready</span>
                </div>
                <p className="text-xs text-slate-600">
                  Click to install 3D Flipbook directly to your device home screen / desktop.
                </p>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.03] cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            </div>
          ) : isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-900">App is already installed!</span> You are
                running in standalone WebApp mode.
              </div>
            </div>
          ) : null}

          {/* Benefits Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-800">No URL Bar</p>
              <p className="text-[10px] text-slate-500">100% full-screen immersive view</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-800">Offline Ready</p>
              <p className="text-[10px] text-slate-500">Works without internet connection</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-800">App Icon</p>
              <p className="text-[10px] text-slate-500">Launches from homescreen / dock</p>
            </div>
          </div>

          {/* Platform Guide Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Installation Guides by Device:
              </h4>
            </div>

            {/* Tab Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>

              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Computer / PC</span>
              </button>

              <button
                onClick={() => setActiveTab('ios')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Android Guide Content */}
            {activeTab === 'android' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <Smartphone className="w-4 h-4" />
                  <span>Android (Chrome, Brave, Edge, Samsung Internet)</span>
                </div>

                <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                  <li className="pl-1">
                    Open your website link in <strong>Google Chrome</strong> or{' '}
                    <strong>Brave / Edge</strong>.
                  </li>
                  <li className="pl-1">
                    Look for the <strong>"Install app"</strong> banner at the bottom or click the{' '}
                    <strong>3 vertical dots menu (⋮)</strong> at top right.
                  </li>
                  <li className="pl-1">
                    Select <strong>"Install app"</strong> or{' '}
                    <strong>"Add to Home screen"</strong>.
                  </li>
                  <li className="pl-1">
                    Tap <strong>"Install"</strong>. The app icon will appear on your phone home
                    screen and will open like a native Android app without any browser URL bar!
                  </li>
                </ol>
              </div>
            )}

            {/* Desktop Guide Content */}
            {activeTab === 'desktop' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <Monitor className="w-4 h-4" />
                  <span>Windows PC, Mac & Linux (Chrome / Edge / Brave)</span>
                </div>

                <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                  <li className="pl-1">
                    Open your URL in <strong>Google Chrome</strong> or{' '}
                    <strong>Microsoft Edge</strong>.
                  </li>
                  <li className="pl-1">
                    Look at the right side of your browser URL/Address bar for the{' '}
                    <strong className="text-slate-900">Install icon (⨁ / computer badge)</strong>, OR
                    click the <strong>3 dots (⋮)</strong> menu.
                  </li>
                  <li className="pl-1">
                    Click <strong>"Install 3D Digital Flipbook Studio..."</strong>.
                  </li>
                  <li className="pl-1">
                    Click <strong>"Install"</strong> in the popup. A dedicated desktop window will
                    open, and a shortcut will be created in your Taskbar / Start Menu / Applications!
                  </li>
                </ol>
              </div>
            )}

            {/* iOS Guide Content */}
            {activeTab === 'ios' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <Apple className="w-4 h-4" />
                  <span>iPhone & iPad (Apple Safari)</span>
                </div>

                <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                  <li className="pl-1">
                    Open your URL in <strong>Safari</strong> (Apple's default browser).
                  </li>
                  <li className="pl-1 flex items-center gap-1.5 flex-wrap">
                    <span>Tap the</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                      <Share className="w-3 h-3 text-sky-600" /> Share button
                    </span>
                    <span>at the bottom toolbar of Safari.</span>
                  </li>
                  <li className="pl-1 flex items-center gap-1.5 flex-wrap">
                    <span>Scroll down and tap</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                      <PlusSquare className="w-3 h-3 text-emerald-600" /> Add to Home Screen
                    </span>
                  </li>
                  <li className="pl-1">
                    Tap <strong className="text-slate-900">"Add"</strong> in the top right corner. The
                    app icon will appear on your iPhone screen and run in standalone fullscreen mode!
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>PWA • Progressive Web App Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
