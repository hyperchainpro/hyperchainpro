'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { t, LOCALES, type Locale } from '@/lib/i18n';

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
  stiffness: 300,
  damping: 30,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthView() {
  const { authView, setAuthView, setUser, setLoading, isLoading } = useAuthStore();
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.resetSent', locale)}
              </p>
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
                className="h-11"
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
            <Label htmlFor="auth-name">{t('auth.name', locale)}</Label>
            <Input
              id="auth-name"
              type="text"
              placeholder={t('auth.namePlaceholder', locale)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-11"
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="auth-email">{t('auth.email', locale)}</Label>
          <Input
            id="auth-email"
            type="email"
            placeholder={t('auth.emailPlaceholder', locale)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-11"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="auth-password">{t('auth.password', locale)}</Label>
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder', locale)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authView === 'register' ? 'new-password' : 'current-password'}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
            <Label htmlFor="auth-confirm-password">{t('auth.confirmPassword', locale)}</Label>
            <Input
              id="auth-confirm-password"
              type="password"
              placeholder={t('auth.passwordPlaceholder', locale)}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="h-11"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Subtle decorative blurs */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-900/10" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/10" />

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
            <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-black/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative">
              <CardHeader className="text-center pb-2">
                {/* Back button */}
                {authView !== 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="absolute left-4 top-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('auth.backToLogin', locale)}
                  </button>
                )}

                {/* Logo */}
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  BranchBoard
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
                    <div className="flex justify-center">
                      {captchaLoading ? (
                        <div className="flex h-[65px] w-[300px] items-center justify-center rounded-md border border-border bg-muted/30">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div ref={captchaRef} />
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {formError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center"
                    >
                      {formError}
                    </motion.p>
                  )}

                  {/* Submit */}
                  {!forgotSent && (
                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitLabel}
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
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('auth.forgotPassword', locale)}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{t('auth.noAccount', locale)}</span>
                      <button
                        type="button"
                        onClick={() => setAuthView('register')}
                        className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
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
                      className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                    >
                      {t('auth.login', locale)}
                    </button>
                  </div>
                )}
                {authView === 'forgot-password' && forgotSent && (
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                  >
                    {t('auth.backToLogin', locale)}
                  </button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Language selector */}
        <div className="mt-4 flex justify-center gap-1">
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
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                locale === l.code
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
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