import Layout from '../components/Layout';

export default function RevisionPlanner() {
  return (
    <Layout activePage="revision-planner" searchPlaceholder="Search sessions...">
      <div className="p-gutter max-w-container-max w-full mx-auto pb-32">
        <div className="flex justify-between items-end mb-stack-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-text-primary">Revision Planner</h2>
            <p className="font-body-md text-body-md text-text-muted mt-2">Organize your daily study sessions.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-soft">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Session
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Hero & Sessions */}
          <div className="lg:col-span-8 space-y-stack-lg">
            {/* Hero Card */}
            <div className="bg-surface rounded-xl p-6 shadow-soft border border-border relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
              <div className="z-10 text-center sm:text-left">
                <h3 className="font-headline-md text-headline-md text-text-primary">GATE 2024</h3>
                <p className="font-body-md text-body-md text-text-muted mt-1">Computer Science &amp; Information Technology</p>
              </div>
              <div className="z-10 flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">128</span>
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Days</span>
                </div>
                {/* Circular Progress Indicator */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-surface-variant" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8" />
                    <circle
                      className="text-primary stroke-current drop-shadow-sm transition-all duration-1000 ease-out"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="45"
                      stroke="currentColor"
                      strokeDasharray="282.7"
                      strokeDashoffset="183.7"
                      strokeWidth="8"
                    />
                  </svg>
                  <span className="absolute material-symbols-outlined text-primary text-3xl">flag</span>
                </div>
              </div>
            </div>
            {/* Today's Sessions */}
            <section>
              <h4 className="font-headline-sm text-headline-sm text-text-primary mb-stack-md flex items-center gap-2">
                Today
                <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded-full font-label-sm text-label-sm ml-2">
                  2 Sessions
                </span>
              </h4>
              <div className="space-y-4">
                {/* Session Card (Upcoming) */}
                <div className="bg-surface rounded-xl p-5 shadow-soft border border-border hover:shadow-hover transition-all group flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[60px] pt-1">
                    <span className="font-label-md text-label-md text-text-primary">2:00</span>
                    <span className="font-label-sm text-label-sm text-text-muted">PM</span>
                  </div>
                  <div className="w-1 bg-primary/20 rounded-full h-12 mt-1 hidden sm:block" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm mb-2">
                          Operating Systems
                        </span>
                        <h5 className="font-headline-sm text-headline-sm text-text-primary mb-1">Process Synchronization</h5>
                        <p className="font-body-md text-body-md text-text-muted line-clamp-1">
                          Review semaphores, mutex locks, and classic problems (Dining Philosophers).
                        </p>
                      </div>
                      <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Session Card (Completed) */}
                <div className="bg-surface rounded-xl p-5 shadow-soft border border-border opacity-75 flex items-start gap-4 bg-surface-container-low">
                  <div className="flex flex-col items-center justify-center min-w-[60px] pt-1 text-text-muted">
                    <span className="font-label-md text-label-md line-through">9:00</span>
                    <span className="font-label-sm text-label-sm">AM</span>
                  </div>
                  <div className="w-1 bg-success/20 rounded-full h-12 mt-1 hidden sm:block" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm mb-2">
                          Algorithms
                        </span>
                        <h5 className="font-headline-sm text-headline-sm text-text-primary mb-1 line-through">Dynamic Programming</h5>
                        <p className="font-body-md text-body-md text-text-muted line-clamp-1">
                          Knapsack problem, Matrix Chain Multiplication.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-success">check_circle</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Tomorrow's Sessions */}
            <section>
              <h4 className="font-headline-sm text-headline-sm text-text-primary mb-stack-md flex items-center gap-2">Tomorrow</h4>
              <div className="space-y-4">
                <div className="bg-surface rounded-xl p-5 shadow-soft border border-border hover:shadow-hover transition-all group flex items-start gap-4 border-l-4 border-l-secondary-container">
                  <div className="flex flex-col items-center justify-center min-w-[60px] pt-1">
                    <span className="font-label-md text-label-md text-text-primary">10:00</span>
                    <span className="font-label-sm text-label-sm text-text-muted">AM</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block bg-secondary-container/10 text-secondary px-3 py-1 rounded-full font-label-sm text-label-sm mb-2">
                          Computer Networks
                        </span>
                        <h5 className="font-headline-sm text-headline-sm text-text-primary mb-1">TCP/IP Congestion Control</h5>
                        <p className="font-body-md text-body-md text-text-muted line-clamp-1">Slow start, AIMD, Fast Retransmit.</p>
                      </div>
                      <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* Right Column: Calendar Widget / Sidebar */}
          <div className="lg:col-span-4 hidden lg:block space-y-stack-md">
            {/* Calendar Placeholder Card */}
            <div className="bg-surface rounded-xl p-6 shadow-soft border border-border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-label-md text-label-md text-text-primary font-bold">October 2023</h4>
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">chevron_left</span>
                  <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">chevron_right</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center font-label-sm text-label-sm text-text-muted mb-2">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center font-body-md text-body-md text-text-primary">
                <div className="p-2 text-text-muted">1</div>
                <div className="p-2">2</div>
                <div className="p-2">3</div>
                <div className="p-2 bg-primary text-on-primary rounded-full shadow-sm">4</div>
                <div className="p-2 relative">
                  5
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary-container rounded-full" />
                </div>
                <div className="p-2">6</div>
                <div className="p-2">7</div>
              </div>
            </div>
            {/* Weekly Goal Progress */}
            <div className="bg-surface rounded-xl p-6 shadow-soft border border-border">
              <h4 className="font-label-md text-label-md text-text-primary mb-4">Weekly Goal</h4>
              <div className="flex justify-between font-label-sm text-label-sm mb-2">
                <span className="text-text-muted">12 / 20 Hours</span>
                <span className="text-primary font-bold">60%</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
        {/* Floating Action Button (Mobile Only) */}
        <button className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 z-50">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>
    </Layout>
  );
}
