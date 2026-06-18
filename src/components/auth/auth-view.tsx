'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { t, LOCALES, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// ─── Turnstile Types ──────────────────────────────────────────────────────────

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          theme?: string;
          size?: string;
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const slideTransition = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 28,
};

// ─── Floating shape component ─────────────────────────────────────────────────

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={cn('pointer-events-none absolute', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 1.5, ease: 'easeOut' }}
    >
      <motion.div
        animate={{
          y: [0, -18, 0, 12, 0],
          rotate: [0, 8, -5, 3, 0],
        }}
        transition={{
          duration: 20 + delay * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="h-full w-full"
      />
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthView() {
  const authView = useAuthStore((s) => s.authView);
  const setAuthView = useAuthStore((s) => s.setAuthView);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);
  const locale = useAuthStore((s) => s.getLocale());

  // Direction for animation
  const [[page, direction], setPage] = useState([0, 0]);
  const prevView = useRef(authView);

  useEffect(() => {
    const viewOrder = ['login', 'register', 'forgot-password'];
    const prevIdx = viewOrder.indexOf(prevView.current);
    const nextIdx = viewOrder.indexOf(authView);
    if (prevIdx !== nextIdx) {
      setPage((p) => [p[0] + 1, nextIdx > prevIdx ? 1 : -1]);
      prevView.current = authView;
    }
  }, [authView]);

  // ─── Form state ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // ─── Captcha state ──
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const captchaRef = useRef<HTMLDivElement>(null);
  const captchaWidgetId = useRef<string | null>(null);

  // ─── Load Turnstile script ──
  useEffect(() => {
    if (document.getElementById('turnstile-script')) return;

    setCaptchaLoading(true);
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;

    window.onTurnstileLoad = () => {
      setCaptchaLoading(false);
      if (captchaRef.current && window.turnstile) {
        captchaWidgetId.current = window.turnstile.render(captchaRef.current, {
          sitekey: '1x00000000000000000000AA',
          callback: (token: string) => {
            setCaptchaToken(token);
          },
          'error-callback': () => {
            setCaptchaToken('');
          },
          theme: 'light',
          size: 'normal',
        });
      }
    };

    script.addEventListener('load', () => window.onTurnstileLoad?.());
    script.addEventListener('error', () => {
      // If Turnstile fails to load (headless, offline, etc.), use fallback token
      setCaptchaToken('dev-bypass-token');
      setCaptchaLoading(false);
    });
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount — it may be re-used
    };
  }, []);

  // ─── Fallback: if captcha hasn't loaded after 5s, use dev token ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setCaptchaToken((prev) => prev || 'dev-bypass-token');
      setCaptchaLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [authView]); // Reset timer when view changes

  // ─── Reset captcha when view changes ──
  useEffect(() => {
    setCaptchaToken('');
    setFormError('');
    setForgotSent(false);
    if (captchaWidgetId.current && window.turnstile) {
      window.turnstile.reset(captchaWidgetId.current);
    }
  }, [authView]);

  // ─── Validation ──
  const validate = useCallback((): boolean => {
    if (authView === 'forgot-password') {
      if (!email.trim()) {
        setFormError(t('auth.emailRequired', locale));
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormError(t('auth.invalidEmail', locale));
        return false;
      }
      return true;
    }

    if (!email.trim()) {
      setFormError(t('auth.emailRequired', locale));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(t('auth.invalidEmail', locale));
      return false;
    }
    if (!password) {
      setFormError(t('auth.passwordRequired', locale));
      return false;
    }
    if (password.length < 6) {
      setFormError(t('auth.passwordMin', locale));
      return false;
    }

    if (authView === 'register') {
      if (!name.trim()) {
        setFormError(t('auth.nameRequired', locale));
        return false;
      }
      if (password !== confirmPassword) {
        setFormError(t('auth.passwordMismatch', locale));
        return false;
      }
    }

    return true;
  }, [authView, email, password, confirmPassword, name, locale]);

  // ─── Submit handler ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!captchaToken) {
      setFormError(t('auth.captchaFailed', locale));
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      if (authView === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, captchaToken }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.error || t('common.error', locale));
          return;
        }

        const { user } = await res.json();
        setUser(user);
      } else if (authView === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password, captchaToken }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.error || t('common.error', locale));
          return;
        }

        const { user } = await res.json();
        setUser(user);
      } else if (authView === 'forgot-password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, captchaToken }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.error || t('common.error', locale));
          return;
        }

        setForgotSent(true);
      }
    } catch {
      setFormError(t('common.error', locale));
    } finally {
      setLoading(false);
    }
  };

  // ─── View titles ──
  const viewTitle = {
    login: t('auth.loginTitle', locale),
    register: t('auth.registerTitle', locale),
    'forgot-password': t('auth.forgotTitle', locale),
  }[authView];

  const viewDescription = {
    login: '',
    register: '',
    'forgot-password': t('auth.forgotDescription', locale),
  }[authView];

  // ─── Render form fields ──
  const renderFields = () => {
    if (authView === 'forgot-password') {
      return (
        <div className="space-y-4">
          {forgotSent ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.15 }}
                className="relative"
              >
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.4 }}
                  className="absolute -top-2 -right-2"
                >
                  <PartyPopper className="h-6 w-6 text-amber-400" />
                </motion.div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-center text-sm font-medium text-foreground"
              >
                {t('auth.resetSent', locale)}
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
                className="h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent origin-center"
              />
            </motion.div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t('auth.email', locale)}</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder={t('auth.emailPlaceholder', locale)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11 neu-input !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 transition-all duration-300"
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Name — only for register */}
        {authView === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="auth-name" className="text-xs font-medium">{t('auth.name', locale)}</Label>
            <Input
              id="auth-name"
              type="text"
              placeholder={t('auth.namePlaceholder', locale)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-11 neu-input !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 transition-all duration-300"
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="auth-email" className="text-xs font-medium">{t('auth.email', locale)}</Label>
          <Input
            id="auth-email"
            type="email"
            placeholder={t('auth.emailPlaceholder', locale)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-11 neu-input !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 transition-all duration-300"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="auth-password" className="text-xs font-medium">{t('auth.password', locale)}</Label>
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder', locale)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authView === 'register' ? 'new-password' : 'current-password'}
              className="h-11 pr-10 neu-input !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] active:bg-foreground/[0.1] transition-all duration-300"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password — only for register */}
        {authView === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="auth-confirm-password" className="text-xs font-medium">{t('auth.confirmPassword', locale)}</Label>
            <Input
              id="auth-confirm-password"
              type="password"
              placeholder={t('auth.passwordPlaceholder', locale)}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="h-11 neu-input !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 transition-all duration-300"
            />
          </div>
        )}
      </div>
    );
  };

  // ─── Submit button text ──
  const submitLabel = {
    login: t('auth.login', locale),
    register: t('auth.register', locale),
    'forgot-password': t('auth.resetPassword', locale),
  }[authView];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#e0e5ec] dark:bg-[#2d2d3a]">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(0,0,0,0.02) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,0,0,0.015) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0.02) 0%, transparent 50%)',
          }}
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 50%, rgba(0,0,0,0.02) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,0,0,0.015) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0.02) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 30%, rgba(0,0,0,0.025) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(0,0,0,0.02) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.015) 0%, transparent 50%)',
              'radial-gradient(ellipse at 20% 50%, rgba(0,0,0,0.02) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,0,0,0.015) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0.02) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="dark:hidden absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating decorative shapes */}
      <FloatingShape
        className="top-[8%] left-[12%] h-16 w-16 rounded-2xl border border-foreground/[0.03] rotate-12"
        delay={0}
      />
      <FloatingShape
        className="top-[15%] right-[15%] h-10 w-10 rounded-full border border-foreground/[0.03] -rotate-6"
        delay={2}
      />
      <FloatingShape
        className="bottom-[20%] left-[8%] h-12 w-12 rounded-xl border border-foreground/[0.03] rotate-45"
        delay={4}
      />
      <FloatingShape
        className="bottom-[12%] right-[10%] h-8 w-20 rounded-lg border border-foreground/[0.03] -rotate-12"
        delay={6}
      />
      <FloatingShape
        className="top-[55%] left-[5%] h-6 w-6 rounded-full border border-foreground/[0.03] rotate-0"
        delay={1}
      />
      <FloatingShape
        className="top-[35%] right-[6%] h-14 w-14 rounded-2xl border border-foreground/[0.03] rotate-[30deg]"
        delay={3}
      />

      {/* Decorative blurs */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-foreground/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-foreground/[0.04] blur-3xl" />

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <Card className={cn(
              'neu-raised !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 rounded-2xl relative',
              'shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.9)]',
              'dark:shadow-[8px_8px_16px_rgba(0,0,0,0.35),-8px_-8px_16px_rgba(50,50,60,0.08)]'
            )}>
              <CardHeader className="text-center pb-2">
                {/* Back button */}
                {authView !== 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="absolute left-4 top-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 neu-flat !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 rounded-xl px-3 py-1.5 hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(50,50,60,0.05)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('auth.backToLogin', locale)}
                  </button>
                )}

                {/* Logo with pulse animation */}
                <motion.div
                  className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground shadow-[5px_5px_10px_rgba(0,0,0,0.08),-5px_-5px_10px_rgba(255,255,255,0.85)] dark:shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(50,50,60,0.08)]"
                  animate={{
                    boxShadow: [
                      '5px 5px 10px rgba(0,0,0,0.08), -5px -5px 10px rgba(255,255,255,0.85)',
                      '7px 7px 14px rgba(0,0,0,0.1), -7px -7px 14px rgba(255,255,255,0.9)',
                      '5px 5px 10px rgba(0,0,0,0.08), -5px -5px 10px rgba(255,255,255,0.85)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <GitBranch className="h-6 w-6 text-background" />
                </motion.div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  LayerBoard
                </CardTitle>
                <CardDescription className="mt-1">
                  {viewTitle}
                </CardDescription>
                {viewDescription && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    {viewDescription}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {renderFields()}

                  {/* Captcha */}
                  {!forgotSent && (
                    <div className="flex justify-center neu-flat !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 rounded-2xl py-3">
                      {captchaLoading ? (
                        <div className="flex h-[65px] w-[300px] items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div ref={captchaRef} />
                      )}
                    </div>
                  )}

                  {/* Error with red left border */}
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto', marginTop: 0 }}
                      exit={{ opacity: 0, x: -8, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-l-[3px] border-l-destructive/70 rounded-r-lg bg-destructive/[0.06] px-4 py-2.5">
                        <p className="text-sm text-destructive text-center">
                          {formError}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit with shimmer loading */}
                  {!forgotSent && (
                    <Button
                      type="submit"
                      variant="neu"
                      className={cn(
                        'w-full h-11 !bg-foreground hover:!bg-foreground/90 !text-background rounded-2xl transition-all duration-300 relative overflow-hidden',
                        isLoading && '!bg-foreground/80'
                      )}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin relative z-10" />}
                      <span className="relative z-10">{submitLabel}</span>
                    </Button>
                  )}
                </form>
              </CardContent>

              <CardFooter className="flex-col gap-3 pb-6">
                {authView === 'login' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot-password')}
                      className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300 neu-flat !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 rounded-xl px-3 py-1.5 hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(50,50,60,0.05)]"
                    >
                      {t('auth.forgotPassword', locale)}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{t('auth.noAccount', locale)}</span>
                      <button
                        type="button"
                        onClick={() => setAuthView('register')}
                        className="font-medium text-foreground transition-all duration-300 neu-flat !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 rounded-xl px-3 py-1.5 hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(50,50,60,0.05)]"
                      >
                        {t('auth.signUp', locale)}
                      </button>
                    </div>
                  </>
                )}
                {authView === 'register' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t('auth.hasAccount', locale)}</span>
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="font-medium text-foreground transition-all duration-300 neu-flat !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 rounded-xl px-3 py-1.5 hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(50,50,60,0.05)]"
                    >
                      {t('auth.login', locale)}
                    </button>
                  </div>
                )}
                {authView === 'forgot-password' && forgotSent && (
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-all duration-300 btn-neu !bg-[#e0e5ec] dark:!bg-[#2d2d3a] !border-0 rounded-2xl px-5 py-2"
                  >
                    {t('auth.backToLogin', locale)}
                  </button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Language selector with accent ring for active */}
        <div className="mt-4 flex justify-center gap-2">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                const { user } = useAuthStore.getState();
                if (user) {
                  useAuthStore.getState().setUser({ ...user, language: l.code });
                }
              }}
              className={cn(
                'text-xs transition-all duration-300 rounded-xl px-3 py-1.5',
                locale === l.code
                  ? 'neu-pressed !bg-[#e0e5ec] dark:!bg-[#2d2d3a] text-foreground font-medium ring-2 ring-foreground/15 ring-offset-1 ring-offset-[#e0e5ec] dark:ring-offset-[#2d2d3a]'
                  : 'neu-flat !bg-[#e0e5ec] dark:!bg-[#2d2d3a] text-muted-foreground hover:text-foreground hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.25),inset_-2px_-2px_4px_rgba(50,50,60,0.05)]'
              )}
              title={l.name}
            >
              {l.flag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}