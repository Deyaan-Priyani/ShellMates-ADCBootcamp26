// components/RankBadge.jsx
// Shows a colored badge for the user's rank tier.
// Exported both ways so it works with named and default imports.

export function RankBadge({ tier }) {
  if (!tier) return null;

  return (
    <span className={`rank-badge rank-${tier.toLowerCase()}`}>{tier}</span>
  );
}

export default RankBadge;
