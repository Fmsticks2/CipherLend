export default function RiskBand({ band }: { band: string }) {
  const colors: Record<string, string> = {
    'AA': 'text-risk-aa border-risk-aa/30 bg-risk-aa/10 glow-aa',
    'A': 'text-risk-a border-risk-a/30 bg-risk-a/10 glow-a',
    'BBB': 'text-risk-bbb border-risk-bbb/30 bg-risk-bbb/10 glow-bbb',
    'BB': 'text-risk-bb border-risk-bb/30 bg-risk-bb/10 glow-bb',
    'B': 'text-risk-b border-risk-b/30 bg-risk-b/10 glow-b',
    'D': 'text-risk-d border-risk-d/30 bg-risk-d/10 glow-d',
  };

  const colorClass = colors[band] || 'text-cipher-muted border-cipher-border bg-cipher-surface';

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass} uppercase tracking-wider`}>
      {band}
    </span>
  );
}
