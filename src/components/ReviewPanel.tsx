import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import StampButton from './primitives/StampButton';
import type { Checkpoint } from '../content/path';
import { REDLINE_INK, alpha, blueprint, body, font, label } from '../design/tokens';

/**
 * Upload a photo of your work and get it looked at.
 *
 * The file goes to /api/review, which holds the rubric and the API key. The
 * browser never sees either. With no key configured the endpoint answers with
 * a clearly-marked placeholder, and this panel says so rather than dressing it
 * up as real feedback.
 */

type Feedback = { stub: boolean; verdict: string; notes: string[] };

export default function ReviewPanel({ checkpoint }: { checkpoint: Checkpoint }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!checkpoint.review) return null;

  const pick = (next: File | null) => {
    setError(null);
    setFeedback(null);
    setFile(next);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(next ? URL.createObjectURL(next) : null);
  };

  const submit = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);

    const form = new FormData();
    form.append('file', file);
    form.append('checkpointId', checkpoint.id);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        body: form,
        credentials: 'same-origin',
      });
      const type = res.headers.get('Content-Type') || '';
      if (!type.includes('application/json')) {
        setError('Design review is not available on this build.');
      } else {
        const data = (await res.json()) as Feedback & { error?: string };
        if (!res.ok) setError(data.error || 'That did not go through.');
        else setFeedback({ stub: !!data.stub, verdict: data.verdict, notes: data.notes || [] });
      }
    } catch {
      setError('Could not reach the review service.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        border: `1px dashed ${alpha.line55}`,
        background: alpha.line08,
      }}
    >
      <span style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 10 }}>
        Get it checked
      </span>

      <p style={{ ...body(13), color: alpha.line75, margin: '0 0 12px' }}>
        Upload a photo or screenshot of your work and have it looked over before you take it to
        Mr. Chroniak.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={checkpoint.review.accepts}
        onChange={(e) => pick(e.target.files?.[0] || null)}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <StampButton rotate={0} onClick={() => inputRef.current?.click()}>
          <Upload size={13} strokeWidth={2.5} />
          {file ? 'Change file' : 'Choose file'}
        </StampButton>

        {file && (
          <StampButton rotate={0} solid onClick={submit} disabled={busy}>
            {busy ? 'Looking…' : 'Send for review'}
          </StampButton>
        )}
      </div>

      {preview && (
        <img
          src={preview}
          alt="Your upload"
          style={{
            display: 'block',
            marginTop: 14,
            maxWidth: '100%',
            maxHeight: 190,
            objectFit: 'contain',
            border: `1px solid ${alpha.line35}`,
          }}
        />
      )}

      {error && (
        <p
          role="alert"
          style={{
            fontFamily: font.hand,
            fontSize: 16,
            color: REDLINE_INK,
            WebkitTextStroke: '0.4px currentColor',
            margin: '12px 0 0',
          }}
        >
          {error}
        </p>
      )}

      {feedback && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${alpha.line35}`,
          }}
        >
          {feedback.stub && (
            <span
              style={{
                ...label,
                fontSize: 10,
                display: 'inline-block',
                marginBottom: 8,
                padding: '3px 8px',
                color: blueprint.bg,
                background: REDLINE_INK,
              }}
            >
              Placeholder — not a real review
            </span>
          )}

          <p
            style={{
              fontFamily: font.mono,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              margin: '0 0 10px',
              color: blueprint.line,
            }}
          >
            {feedback.verdict}
          </p>

          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {feedback.notes.map((note) => (
              <li key={note} style={{ ...body(13.5), color: alpha.textPrimary, marginBottom: 6 }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
