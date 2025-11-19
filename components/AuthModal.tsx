import React, { useState, useEffect } from 'react';
import { X, Smartphone, Lock, Mail, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: {
    loginTitle: string;
    tabPassword: string;
    tabPhone: string;
    accountLabel: string;
    accountPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    sendCode: string;
    codeSent: string;
    signIn: string;
  };
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, t }) => {
  const [mode, setMode] = useState<'password' | 'phone'>('password');
  const [isClosing, setIsClosing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setMode('password');
    }
  }, [isOpen]);

  // Countdown timer for code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200); // Match animation duration
  };

  const handleSendCode = () => {
    if (countdown === 0) {
      setCountdown(60);
      // Simulate API call
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-200 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{t.loginTitle}</h2>
          <button 
            onClick={handleClose}
            className="rounded-full p-1 text-muted hover:bg-muted/10 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'password' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted hover:text-foreground'}`}
            onClick={() => setMode('password')}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock size={16} />
              {t.tabPassword}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'phone' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted hover:text-foreground'}`}
            onClick={() => setMode('phone')}
          >
             <div className="flex items-center justify-center gap-2">
              <Smartphone size={16} />
              {t.tabPhone}
            </div>
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {mode === 'password' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.accountLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="text" 
                      placeholder={t.accountPlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.passwordLabel}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="password" 
                      placeholder={t.passwordPlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.phoneLabel}</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="tel" 
                      placeholder={t.phonePlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">{t.codeLabel}</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder={t.codePlaceholder}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      className="min-w-[100px] rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {countdown > 0 ? `${countdown}s` : t.sendCode}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit"
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-all"
            >
              {t.signIn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;