import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import StampButton from './primitives/StampButton';
import type { Checkpoint } from '../content/path';
import { stlToPng } from '../lib/stlToPng';
import { REDLINE_INK, alpha, blueprint, body, font, label } from '../design/tokens';

/**
 * Upload your work, say what you were going for, and get it scored.
 *
 * Accepts an STL as well as a picture. A vision model cannot read a mesh, so
 * an STL is rendered to a three-view sheet in the browser first and that image
 * is what gets sent. The alternative was telling people to go and screenshot
 * their own CAD, which is friction for no reason when the geometry is right
 * here.
 *
 * The written description is required, and not only because it makes the
 * review better. Having to say what you were aiming for is the part that makes
 * you notice you did not aim at anything in particular.
 *
 * The rubric and the API key both live in /api/review. Neither reaches the
 * browser.
 */

type Feedback = { stub: boolean; score?: number; verdict: string; notes: string[] };

const isStl = (f: File) => /\.stl$/i.test(f.name);
/** Rejected on both sides: the reviewer cannot read a vector file. */
const isSvg = (f: File) => f.type === 'image/svg+xml' || /\.svg$/i.test(f.name);

/*
 * No minimum. Saying what you were going for genuinely improves the review, so
 * the box asks for it and explains why, but making it a gate turned a two-click
 * upload into homework. Anyone who wants to just send the file can.
 */
const MAX_DESCRIPTION = 1200;

/**
 * A full review reads the whole rubric and comes back with several specific
 * notes, so it takes the better part of a minute. Saying nothing for that long
 * looks broken, so the wait narrates itself.
 */
const STAGES: [number, string][] = [
  [0, 'Sending it over…'],
  [3, 'Looking at the geometry…'],
  [9, 'Checking it against the objective…'],
  [18, 'Writing up what to fix…'],
  [40, 'Still going. A thorough one takes a while.'],
];

export default function ReviewPanel({ checkpoint }: { checkpoint: Checkpoint }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [upload, setUpload] = useState<Blob[] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [rendering, setRendering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Drives the staged wait copy. Only runs while a review is actually out.
  useEffect(() => {
    if (!busy) return;
    setElapsed(0);
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [busy]);

  if (!checkpoint.review) return null;
  const takesStl = checkpoint.review.accepts.includes('.stl');

  const ready = !!upload?.length && !busy && !rendering;

  const pick = async (file: File | null) => {
    setError(null);
    setFeedback(null);
    setNote(null);
    if (preview) URL.revokeObjectURL(preview);

    if (!file) {
      setUpload(null);
      setPreview(null);
      setName(null);
      return;
    }

    setName(file.name);

    if (isSvg(file)) {
      setUpload(null);
      setPreview(null);
      setError(
        'A vector SVG cannot be reviewed. Export it as a PNG or JPG, or screenshot it, and upload that.',
      );
      return;
    }

    if (!isStl(file)) {
      setUpload([file]);
      setPreview(URL.createObjectURL(file));
      return;
    }

    // Render it here, so what gets reviewed is something a model can read.
    setRendering(true);
    try {
      const { url, views, triangles } = await stlToPng(file);
      // The three views go up separately; the contact sheet is what is shown.
      setUpload(views);
      setPreview(url);
      setNote(`${triangles.toLocaleString()} triangles, rendered to three views for review`);
    } catch {
      setUpload(null);
      setPreview(null);
      setError(
        'That STL file could not be read. Save it out of your CAD program again, or upload a '
          + 'screenshot instead.',
      );
    } finally {
      setRendering(false);
    }
  };

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);

    const form = new FormData();
    // One `file` entry per image, so the endpoint reads them with getAll.
    upload!.forEach((part, i) => form.append('file', part, `submission-${i}.png`));
    form.append('checkpointId', checkpoint.id);
    form.append('description', description.trim().slice(0, MAX_DESCRIPTION));

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
        else
          setFeedback({
            stub: !!data.stub,
            score: typeof data.score === 'number' ? data.score : undefined,
            verdict: typeof data.verdict === 'string' ? data.verdict : 'Reviewed',
            // Only strings get rendered. A note that arrives as an object is a
            // React child that throws, which took the whole panel down with it
            // rather than degrading to one missing line.
            notes: Array.isArray(data.notes)
              ? data.notes.filter((n): n is string => typeof n === 'string' && n.length > 0)
              : [],
          });
      }
    } catch {
      setError('Could not reach the review service.');
    } finally {
      setBusy(false);
    }
  };

  const field: React.CSSProperties = {
    width: '100%',
    padding: '10px 11px',
    background: alpha.line08,
    border: `1px solid ${alpha.line55}`,
    color: blueprint.line,
    fontFamily: font.mono,
    fontSize: 13.5,
    lineHeight: 1.55,
    letterSpacing: '0.02em',
    outline: 'none',
    minHeight: 76,
    resize: 'vertical',
  };

  const waiting = STAGES.filter(([at]) => elapsed >= at).pop()?.[1] ?? STAGES[0][1];

  return (
    <div
      data-review={checkpoint.id}
      style={{
        marginTop: 14,
        padding: 14,
        border: `1px dashed ${alpha.line55}`,
        background: alpha.line08,
      }}
    >
      <span style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 10 }}>
        Get it scored
      </span>

      <p style={{ ...body(13), color: alpha.line75, margin: '0 0 12px' }}>
        {takesStl
          ? 'Upload your STL file, which is what CAD saves out for printing, or just a photo of the part. You get a score out of 100 and what to fix.'
          : 'Upload a photo or screenshot of your work. You get a score out of 100 and what to fix.'}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={checkpoint.review.accepts}
        onChange={(e) => void pick(e.target.files?.[0] || null)}
        style={{ display: 'none' }}
      />

      <StampButton rotate={0} onClick={() => inputRef.current?.click()} disabled={busy || rendering}>
        <Upload size={13} strokeWidth={2.5} />
        {name ? 'Change file' : takesStl ? 'Choose STL or photo' : 'Choose file'}
      </StampButton>

      {name && (
        <p style={{ ...label, fontSize: 10, color: alpha.line55, margin: '10px 0 0' }}>
          {name}
          {note ? ` — ${note}` : ''}
        </p>
      )}

      {rendering && (
        <p style={{ ...body(12.5), color: alpha.line75, margin: '8px 0 0' }}>
          Rendering your model…
        </p>
      )}

      {preview && (
        <img
          src={preview}
          alt="What is being sent for review"
          style={{
            display: 'block',
            marginTop: 12,
            maxWidth: '100%',
            maxHeight: 200,
            objectFit: 'contain',
            border: `1px solid ${alpha.line35}`,
            background: '#fff',
          }}
        />
      )}

      <label
        htmlFor={`desc-${checkpoint.id}`}
        style={{ ...label, color: alpha.line75, display: 'block', margin: '16px 0 6px' }}
      >
        What were you going for? <span style={{ textTransform: 'none' }}>(optional)</span>
      </label>
      <p style={{ ...body(12.5), color: alpha.line55, margin: '0 0 8px' }}>
        Skip it if you like. It does help though: the reviewer only sees the picture, so anything
        it cannot see, only you can tell it.
      </p>
      <textarea
        id={`desc-${checkpoint.id}`}
        value={description}
        maxLength={MAX_DESCRIPTION}
        onChange={(e) => setDescription(e.target.value)}
        disabled={busy}
        placeholder="A motor bracket. I wanted the two holes exactly 24mm apart and the wall thick enough not to flex. The corner gusset was the hard part."
        style={field}
      />
      {description.length > 0 && (
        <p
          style={{
            ...label,
            fontSize: 10,
            color: alpha.line55,
            margin: '6px 0 0',
            textAlign: 'right',
          }}
        >
          {description.trim().length}/{MAX_DESCRIPTION}
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        <StampButton rotate={0} solid onClick={submit} disabled={!ready}>
          {busy ? 'Reviewing…' : 'Send for review'}
        </StampButton>
      </div>

      {busy && (
        <p
          aria-live="polite"
          style={{ ...body(12.5), color: alpha.line75, margin: '10px 0 0' }}
        >
          {waiting} <span style={{ color: alpha.line55 }}>({elapsed}s)</span>
        </p>
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
          data-review-result={typeof feedback.score === 'number' ? feedback.score : 'stub'}
          style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${alpha.line35}` }}
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

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            {typeof feedback.score === 'number' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 3,
                  border: `2px solid ${blueprint.line}`,
                  padding: '6px 12px',
                  transform: 'rotate(-1.2deg)',
                }}
              >
                <span
                  style={{
                    fontFamily: font.mono,
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: blueprint.line,
                  }}
                >
                  {feedback.score}
                </span>
                <span style={{ ...label, fontSize: 10, color: alpha.line75 }}>/100</span>
              </span>
            )}

            <span
              style={{
                fontFamily: font.mono,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: blueprint.line,
              }}
            >
              {feedback.verdict}
            </span>
          </div>

          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {feedback.notes.map((n) => (
              <li key={n} style={{ ...body(13.5), color: alpha.textPrimary, marginBottom: 6 }}>
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
