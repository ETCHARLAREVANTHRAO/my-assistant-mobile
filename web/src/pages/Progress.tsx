import Layout from '../components/Layout';

export default function Progress() {
  return (
    <Layout activePage="progress" searchPlaceholder="Search concepts, past questions...">
      <div className="max-w-[1200px] mx-auto space-y-gutter px-4 md:px-gutter pb-12">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-text-primary mb-2">Performance Overview</h2>
          <p className="font-body-md text-body-md text-text-muted">Tracking your readiness across core subjects.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Subject Accuracy (Main Area) */}
          <div className="md:col-span-8 bg-surface rounded-xl p-6 border border-border shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-text-primary">Subject Accuracy</h3>
              <button className="text-primary font-label-sm text-label-sm hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Algorithms', pct: 82, color: 'text-success', bar: 'bg-success' },
                { label: 'DBMS', pct: 68, color: 'text-primary', bar: 'bg-primary' },
                { label: 'Operating Systems', pct: 55, color: 'text-primary', bar: 'bg-primary' },
                { label: 'Computer Networks', pct: 34, color: 'text-error', bar: 'bg-error' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-label-md text-label-md text-text-primary">{row.label}</span>
                    <span className={`font-code text-code font-semibold ${row.color}`}>{row.pct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2.5">
                    <div className={`${row.bar} h-2.5 rounded-full`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Recommended Next (Side Area) */}
          <div className="md:col-span-4 bg-primary-container text-on-primary-container rounded-xl p-6 border border-primary-fixed-dim shadow-soft flex flex-col justify-between hover:shadow-hover transition-all">
            <div>
              <div className="flex items-center gap-2 mb-4 text-secondary-fixed">
                <span className="material-symbols-outlined">explore</span>
                <h3 className="font-headline-sm text-headline-sm">Recommended Next</h3>
              </div>
              <p className="font-body-md text-body-md opacity-90 mb-4">
                Focus on <strong className="text-white">Computer Networks</strong>. It has high weightage (8-10
                marks) but your current accuracy is low (34%).
              </p>
              <div className="bg-inverse-surface/20 rounded-lg p-3 mb-6">
                <div className="font-label-sm text-label-sm opacity-80 mb-1">Target Topic</div>
                <div className="font-label-md text-label-md text-white">Subnetting &amp; Routing Protocols</div>
              </div>
            </div>
            <button className="w-full bg-white text-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                menu_book
              </span>
              Start Study Session
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-gutter">
          {/* Weakest Topics Card */}
          <div className="bg-surface rounded-xl p-6 border border-border shadow-soft flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-error">
              <span className="material-symbols-outlined">warning</span>
              <h3 className="font-headline-sm text-headline-sm text-text-primary">Weakest Topics</h3>
            </div>
            <div className="space-y-4 flex-1">
              {[
                { tag: 'OS', label: 'Virtual Memory', pct: 25, gradient: true },
                { tag: 'DBMS', label: 'B+ Tree Deletion', pct: 40, gradient: false },
                { tag: 'TOC', label: 'Turing Machine Decidability', pct: 45, gradient: false },
              ].map((topic) => (
                <div
                  key={topic.label}
                  className="flex items-center justify-between p-4 bg-error-container/10 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-surface border border-border px-2 py-0.5 rounded-full font-label-sm text-label-sm text-text-muted">
                        {topic.tag}
                      </span>
                      <h4 className="font-label-md text-label-md text-text-primary">{topic.label}</h4>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 max-w-[150px]">
                      <div
                        className={`${topic.gradient ? 'bg-gradient-to-r from-error to-success' : 'bg-primary'} h-1.5 rounded-full`}
                        style={{ width: `${topic.pct}%` }}
                      />
                    </div>
                  </div>
                  <button className="ml-4 px-3 py-1.5 bg-surface text-primary border border-border rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-colors flex items-center gap-1 shadow-sm">
                    Practice
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Mock Test History */}
          <div className="bg-surface rounded-xl p-6 border border-border shadow-soft flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-text-primary">Mock Test History</h3>
              <button className="text-text-muted hover:text-primary transition-colors">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { date: 'Oct 24, 2023', title: 'Full Length Mock 3', score: '52/100', note: '+4 from Mock 2', icon: 'task_alt', active: true },
                { date: 'Oct 10, 2023', title: 'Full Length Mock 2', score: '48/100', note: 'Struggled with Aptitude section.', icon: 'analytics', active: false },
                { date: 'Sep 15, 2023', title: 'Diagnostic Test', score: '35/100', note: '', icon: 'analytics', active: false },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`flex items-center gap-4 p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all ${item.active ? 'bg-surface' : 'bg-surface opacity-80'}`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-surface shrink-0 shadow-sm ${item.active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-text-muted'}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-label-sm text-label-sm text-text-muted">{item.date}</span>
                      <span className="font-code text-code text-primary font-bold">{item.score}</span>
                    </div>
                    <h4 className="font-label-md text-label-md text-text-primary mb-1">{item.title}</h4>
                    {item.note && (
                      <p className="font-label-sm text-label-sm text-text-muted truncate">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-2 border border-border rounded-lg text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors">
              View All Reports
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
