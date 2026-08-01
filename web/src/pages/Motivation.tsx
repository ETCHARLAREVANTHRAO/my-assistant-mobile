import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getMotivation } from '../services/api';

export default function Motivation() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { getMotivation().then(setData).catch(() => setData(null)); }, []);
  if (!data) return <Layout activePage="motivation" title="Motivation"><div className="p-gutter">Loading...</div></Layout>;
  return <Layout activePage="motivation" title="Motivation"><div className="p-gutter max-w-container-max mx-auto pb-32 space-y-5">
    <div className="grid md:grid-cols-2 gap-4"><Card icon="format_quote" title="Daily Quote" text={data.daily_quote} /><Card icon="emoji_events" title="Daily Challenge" text={data.daily_challenge} /></div>
    <section className="bg-surface rounded-lg border border-border shadow-soft p-5"><h3 className="font-headline-sm text-headline-sm mb-4">Pomodoro Timer</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Object.entries(data.pomodoro).map(([k,v]) => <div key={k} className="rounded-lg bg-surface-container-lowest p-4"><p className="text-text-muted">{k.replaceAll('_',' ')}</p><p className="font-headline-sm text-primary">{String(v)}</p></div>)}</div></section>
    <section className="bg-surface rounded-lg border border-border shadow-soft p-5"><h3 className="font-headline-sm text-headline-sm mb-4">Progress Badges</h3><div className="grid md:grid-cols-2 gap-3">{data.progress_badges.map((b: any) => <div key={b.name} className="rounded-lg bg-surface-container-lowest p-4"><p className="font-label-md text-text-primary">{b.name}</p><p className="text-text-muted">{b.rule}</p></div>)}</div></section>
    <Card icon="local_fire_department" title="Consistency Rewards" text={`Current streak: ${data.consistency.current_streak} days. Earned: ${data.earned_rewards.join(', ') || 'none yet'}.`} />
  </div></Layout>;
}
function Card({ icon, title, text }: { icon: string; title: string; text: string }) { return <section className="bg-surface rounded-lg border border-border shadow-soft p-5"><h3 className="font-headline-sm text-headline-sm mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-primary">{icon}</span>{title}</h3><p className="font-body-lg text-body-lg text-on-surface">{text}</p></section>; }
