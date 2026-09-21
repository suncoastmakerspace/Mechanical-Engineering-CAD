import { useEffect, useState } from 'react';
import { LogOut, Menu, User, X } from 'lucide-react';
import LoginDialog from '../auth/LoginDialog';
import { useAuth } from '../auth/AuthContext';
import { SECTION_IDS, alpha, blueprint, font } from '../design/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * Fixed pill navbar. The pill geometry is fixed by the brief
 * (12px radius, 13/22/8 padding, 40px tall, 13px uppercase at 0.07em) and
 * recoloured to the blueprint palette: a 12% white fill behind a 1px white
 * rule, rather than frosted cream.
 */

const LINKS = [
  { id: SECTION_IDS.hero, label: 'Overview' },
  { id: SECTION_IDS.map, label: 'Schematic' },
  { id: SECTION_IDS.pacing, label: 'Pacing' },
  { id: SECTION_IDS.brk, label: 'Advice' },
  { id: SECTION_IDS.footer, label: "What's Next" },
];

type Props = { activeSection: string };

export default function Navbar({ activeSection }: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, ready, signOut } = useAuth();

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  const pill = (active: boolean): React.CSSProperties => ({
    position: 'relative',
    height: 40,
    padding: '13px 22px 8px',
    borderRadius: 12,
    border: `1px solid ${blueprint.line}`,
    background: active ? alpha.line20 : alpha.line12,
    color: blueprint.line,
    fontFamily: font.mono,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    lineHeight: 1,
    cursor: 'pointer',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    transition: 'background 160ms ease',
    whiteSpace: 'nowrap',
  });

  /** The active pill carries a dot under its label. */
  const dot = (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        bottom: 6,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: blueprint.line,
      }}
    />
  );

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        padding: isMobile ? '14px 16px' : '18px 28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: '6px 0',
          color: blueprint.line,
        }}
      >
        <span
          style={{
            fontFamily: font.mono,
            fontSize: isMobile ? 12 : 13,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          ME / CAD
        </span>
        <span
          style={{
            fontFamily: font.mono,
            fontSize: 9,
            letterSpacing: '0.2em',
            color: alpha.line55,
          }}
        >
          DOC-001 REV.A
        </span>
      </div>

      {isMobile ? (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              ...pill(false),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              padding: 0,
            }}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>

          {open && (
            <nav
              style={{
                position: 'absolute',
                top: 50,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 12,
                minWidth: 190,
                borderRadius: 12,
                border: `1px solid ${blueprint.line}`,
                background: 'rgba(119,141,178,0.82)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
              }}
            >
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => go(l.id)}
                  style={{ ...pill(activeSection === l.id), textAlign: 'left' }}
                >
                  {l.label}
                  {activeSection === l.id && dot}
                </button>
              ))}

              {ready && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (user) void signOut();
                    else setShowLogin(true);
                  }}
                  style={{
                    ...pill(false),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                  }}
                >
                  {user ? <LogOut size={13} /> : <User size={13} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user ? user.displayName : 'Sign in'}
                  </span>
                </button>
              )}
            </nav>
          )}
        </div>
      ) : (
        <nav style={{ display: 'flex', gap: 10 }}>
          {LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(l.id)}
              style={pill(activeSection === l.id)}
            >
              {l.label}
              {activeSection === l.id && dot}
            </button>
          ))}

          {/*
            Progress is saved against an account, so the state of this pill is
            what tells a member whether their ticks are being kept.
          */}
          {ready && (
            <button
              type="button"
              onClick={() => (user ? void signOut() : setShowLogin(true))}
              title={user ? `Signed in as ${user.displayName}` : 'Sign in to save your progress'}
              style={{
                ...pill(false),
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                maxWidth: 210,
              }}
            >
              {user ? <LogOut size={13} /> : <User size={13} />}
              <span
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {user ? user.displayName : 'Sign in'}
              </span>
            </button>
          )}
        </nav>
      )}

      {showLogin && <LoginDialog onClose={() => setShowLogin(false)} />}
    </header>
  );
}
