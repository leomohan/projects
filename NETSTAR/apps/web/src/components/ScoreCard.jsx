export function ScoreCard({ label, value, accent, helper }) {
  return (
    <article className="score-card">
      <span className="score-card__label">{label}</span>
      <strong className="score-card__value" style={{ color: accent }}>
        {value}
      </strong>
      <span className="score-card__helper">{helper}</span>
    </article>
  );
}
