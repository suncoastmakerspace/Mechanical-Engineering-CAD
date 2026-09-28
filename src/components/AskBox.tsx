import { useRef, useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import StampButton from './primitives/StampButton';
import type { Checkpoint } from '../content/path';
import { REDLINE_INK, alpha, blueprint, body, font, label } from '../design/tokens';

/**
 * One short question about the project you are on.
 *
 * For the moment where the brief says something you have not met before and
 * there is nobody in the room to ask. Collapsed by default: the answer to
 * "what does fully constrained mean" should be a click away, but not so
 * present that it becomes the first thing anyone reaches for.
 *
 * Three a day per account, counted server side. The count shown here comes
 * back from the endpoint rather than being tracked in the browser, because the
 * browser is not where a limit can be enforced.
 */

type Answer = { stub: boolean; answer: string; used: number; limit: number };

export default function AskBox({ checkpoint }: { checkpoint: Checkpoint }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  const ask = async () => {
    if (busy || question.trim().length < 5) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ checkpointId: checkpoint.id, question: question.trim() }),
      });
      const type = res.headers.get('Content-Type') || '';
      if (!type.includes('application/json')) {
        setError('Questions are not available on this build.');
      } else {
        const data = (await res.json()) as Answer & { error?: string };
        if (!res.ok) setError(data.error || 'That did not go through.');
        else setAnswer({ stub: !!data.stub, answer: data.answer, used: data.used, limit: data.limit });
      }
    } catch {
      setError('Could not reach the help service.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div style={{ marginTop: 12 }}>
        <StampButton
          rotate={0}
          onClick={() => {
            setOpen(true);
            // Straight into typing: the button was the decision, not the box.
            window.setTimeout(() => boxRef.current?.focus(), 30);
          }}
        >
          <MessageCircleQuestion size={13} strokeWidth={2.5} />
          Stuck? Ask a question
        </StampButton>
      </div>
    );
  }

  return (
    <div
      data-ask={checkpoint.id}
      style={{
        marginTop: 12,
        padding: 14,
        border: `1px dashed ${alpha.line55}`,
        background: alpha.line08,
      }}
    >
      <label
        htmlFor={`ask-${checkpoint.id}`}
        style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 8 }}
      >
        Ask about this project
      </label>
      <p style={{ ...body(12.5), color: alpha.line55, margin: '0 0 10px' }}>
        One question, answered plainly. Three a day. It will point you at how to work something
        out rather than hand you the numbers.
      </p>

      <textarea
        ref={boxRef}
        id={`ask-${checkpoint.id}`}
        value={question}
        maxLength={400}
        disabled={busy}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What does fully constrained actually mean?"
        style={{
          width: '100%',
          padding: '10px 11px',
          background: alpha.line08,
          border: `1px solid ${alpha.line55}`,
          color: blueprint.line,
          fontFamily: font.mono,
          fontSize: 13.5,
          lineHeight: 1.55,
          outline: 'none',
          minHeight: 58,
          resize: 'vertical',
        }}
      />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <StampButton rotate={0} solid onClick={ask} disabled={busy || question.trim().length < 5}>
          {busy ? 'Asking…' : 'Ask'}
        </StampButton>
        {answer && !answer.stub && (
          <span style={{ ...label, fontSize: 10, color: alpha.line55 }}>
            {answer.used} of {answer.limit} used today
          </span>
        )}
      </div>

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

      {answer && (
        <div
          data-ask-answer=""
          style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${alpha.line35}` }}
        >
          {answer.stub && (
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
              Placeholder — not a real answer
            </span>
          )}
          <p style={{ ...body(13.5), color: alpha.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>
            {answer.answer}
          </p>
        </div>
      )}
    </div>
  );
}
