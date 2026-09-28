import { useState } from 'react';
import { Eye } from 'lucide-react';
import ModelViewer from './ModelViewer';
import StampButton from './primitives/StampButton';
import type { Checkpoint } from '../content/path';
import { alpha, body, label } from '../design/tokens';

/**
 * "Here is roughly what you were aiming at."
 *
 * Available on every checkpoint from the start, and still behind a click.
 *
 * It used to unlock only once the work was submitted or ticked, on the
 * reasoning that an answer handed over up front becomes a thing to copy. The
 * click is what actually carries that: nobody sees a reference by accident, and
 * someone who is stuck and wants to see a worked example should not have to
 * claim they finished in order to get one.
 */

type Props = {
  checkpoint: Checkpoint;
};

export default function ReferenceReveal({ checkpoint }: Props) {
  const [open, setOpen] = useState(false);
  const ref = checkpoint.reference;

  if (!ref) return null;

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: `1px dashed ${alpha.line35}`,
      }}
    >
      {!open ? (
        <>
          <StampButton rotate={0} onClick={() => setOpen(true)}>
            <Eye size={13} strokeWidth={2.5} />
            See one that works
          </StampButton>
          <p style={{ ...body(12.5), color: alpha.line55, margin: '10px 0 0' }}>
            A reference, not a template. Look whenever you like, before or after. Yours
            does not have to match it.
          </p>
        </>
      ) : (
        <>
          <span style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 10 }}>
            {ref.kind === 'model' ? 'Reference model' : 'Reference drawing'}
          </span>

          {ref.kind === 'model' ? (
            <ModelViewer src={ref.src} caption={ref.caption} />
          ) : (
            <figure style={{ margin: 0 }}>
              <img
                src={ref.src}
                alt={ref.caption}
                style={{
                  display: 'block',
                  width: '100%',
                  border: `1px solid ${alpha.line55}`,
                  background: alpha.line08,
                  padding: 8,
                }}
              />
              <figcaption
                style={{ ...label, fontSize: 10, color: alpha.line55, marginTop: 8 }}
              >
                {ref.caption}
              </figcaption>
            </figure>
          )}
        </>
      )}
    </div>
  );
}
