export default function RiskBand({ band }: { band: string }) {
  const colors: Record<string, string> = {
    'AA': 'text-risk-aa border-risk-aa/20 bg-risk-aa/10',
    'A': 'text-risk-a border-risk-a/20 bg-risk-a/10',
    'BBB': 'text-risk-bbb border-risk-bbb/20 bg-risk-bbb/10',
    'BB': 'text-risk-bb border-risk-bb/20 bg-risk-bb/10',
    'B': 'text-risk-b border-risk-b/20 bg-risk-b/10',
    'D': 'text-risk-d border-risk-d/20 bg-risk-d/10',
  };

  const colorClass = colors[band] || 'text-zinc-400 border-white/10 bg-white/5';

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-mono font-medium border ${colorClass} uppercase tracking-widest`}>
      {band}
    </span>
  );
}
