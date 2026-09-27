import { useState } from 'react';
import { Eye } from 'lucide-react';
import ModelViewer from './ModelViewer';
import StampButton from './primitives/StampButton';
import type { Checkpoint } from '../content/path';
import { alpha, body, label } from '../design/tokens';

/**
 * "Here is roughly what you were aiming at."
 *
 * Deliberately behind a click even once it is available: handed over
 * automatically it becomes a thing to copy, and the point of the checkpoint is
 * the attempt. It only appears at all once the work has been submitted or
 * marked finished.
 */

type Props = {
  checkpoint: Checkpoint;
  /** True once this checkpoint has been submitted for review or ticked off. */
  available: boolean;
};

export default function ReferenceReveal({ checkpoint, available }: Props) {
  const [open, setOpen] = useState(false);
  const ref = checkpoint.reference;

  if (!ref || !available) return null;

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
            A reference, not a template. Yours does not have to match it.
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
