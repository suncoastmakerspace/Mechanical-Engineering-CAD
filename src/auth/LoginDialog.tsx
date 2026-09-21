import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import CrosshairCard from '../components/primitives/CrosshairCard';
import StampButton from '../components/primitives/StampButton';
import {
  REDLINE_INK,
  alpha,
  blueprint,
  body,
  font,
  heading,
  label,
} from '../design/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useAuth } from './AuthContext';

/**
 * Sign-in, drawn as a permit slip rather than a web form so it belongs on the
 * sheet. Portaled to <body> for the same reason the stage panel is: the
 * sections wrap their children in a stacking context.
 */

export default function LoginDialog({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  const { signIn, signUp, online } = useAuth();

  /** One dialog, two jobs. Members overwhelmingly arrive needing the second. */
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signingUp = mode === 'up';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const message = signingUp
      ? await signUp(username, password, displayName)
      : await signIn(username, password);
    setBusy(false);
    if (message) setError(message);
    else onClose();
  };

  const field: React.CSSProperties = {
    width: '100%',
    padding: '11px 12px',
    background: alpha.line08,
    border: `1px solid ${alpha.line55}`,
    color: blueprint.line,
    fontFamily: font.mono,
    fontSize: 15,
    letterSpacing: '0.04em',
    outline: 'none',
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 16 : 40,
        background: 'rgba(0,0,0,0.42)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 420 }}>
        <CrosshairCard
          weight={2}
          serial="ACCESS"
          readout="MEMBERS ONLY"
          style={{ background: blueprint.bg, padding: isMobile ? 20 : 26 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <h3 style={{ ...heading(isMobile ? 20 : 24), marginBottom: 6 }}>
              {signingUp ? 'Create account' : 'Sign in'}
            </h3>
            <button
              type="button"
              aria-label="Close sign in"
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${blueprint.line}`,
                background: 'transparent',
                color: blueprint.line,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={15} />
            </button>
          </div>

          <p style={{ ...body(13), color: alpha.line75, marginBottom: 18 }}>
            {signingUp
              ? 'Pick a username and password. Your finished checkpoints are saved against it, on any device you sign in from.'
              : 'Signing in saves your checkpoints so the map remembers where you got to.'}
          </p>

          {!online && (
            <p
              style={{
                ...body(13),
                color: REDLINE_INK,
                fontFamily: font.hand,
                fontSize: 16,
                marginBottom: 16,
              }}
            >
              accounts are not switched on for this build yet
            </p>
          )}

          <form onSubmit={submit}>
            <label
              htmlFor="login-username"
              style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 6 }}
            >
              Username
            </label>
            <input
              id="login-username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              style={{ ...field, marginBottom: 14 }}
            />

            {signingUp && (
              <>
                <label
                  htmlFor="login-name"
                  style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 6 }}
                >
                  Your name
                </label>
                <input
                  id="login-name"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                  placeholder="shown in the corner when you are signed in"
                  style={{ ...field, marginBottom: 14 }}
                />
              </>
            )}

            <label
              htmlFor="login-password"
              style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 6 }}
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={signingUp ? 'new-password' : 'current-password'}
              style={{ ...field, marginBottom: signingUp ? 6 : 18 }}
            />

            {signingUp && (
              <p style={{ ...body(12), color: alpha.line55, margin: '0 0 18px' }}>
                At least 8 characters. Do not reuse a password from anywhere else.
              </p>
            )}

            {error && (
              <p
                role="alert"
                style={{
                  fontFamily: font.hand,
                  fontSize: 17,
                  color: REDLINE_INK,
                  WebkitTextStroke: '0.4px currentColor',
                  margin: '0 0 16px',
                }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <StampButton type="submit" solid rotate={-1} disabled={busy || !online}>
                {busy
                  ? signingUp
                    ? 'Creating…'
                    : 'Checking…'
                  : signingUp
                    ? 'Create account'
                    : 'Sign in'}
              </StampButton>

              <button
                type="button"
                onClick={() => {
                  setMode(signingUp ? 'in' : 'up');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: alpha.line75,
                  fontFamily: font.mono,
                  fontSize: 12.5,
                  letterSpacing: '0.04em',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                {signingUp ? 'I already have an account' : 'Create an account'}
              </button>
            </div>
          </form>
        </CrosshairCard>
      </div>
    </div>,
    document.body,
  );
}
