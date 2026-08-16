/**
 * "The call" — a standing block on every project and essay.
 *
 * It states the decision, the alternative that was rejected, why, and
 * what the choice cost. It is the strategist thesis expressed
 * structurally rather than asserted, it is the part of a technical
 * writeup most people omit, and it is interview rehearsal in public.
 */
export function TheCall({
  decision,
  alternative,
  whyNot,
  cost,
}: {
  decision: string;
  alternative: string;
  whyNot: string;
  cost: string;
}) {
  return (
    <section className="call" aria-label="The call">
      <span className="call-label">The call</span>
      <dl>
        <div>
          <dt>Decision</dt>
          <dd>{decision}</dd>
        </div>
        <div>
          <dt>The alternative</dt>
          <dd>{alternative}</dd>
        </div>
        <div>
          <dt>Why not</dt>
          <dd>{whyNot}</dd>
        </div>
        <div>
          <dt>What it cost</dt>
          <dd>{cost}</dd>
        </div>
      </dl>
    </section>
  );
}
