"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Eye, Users, FileText, TrendingUp, Globe, BarChart3,
  Lock, Loader2, RefreshCw, ArrowUpRight, ArrowDownRight,
  Contact, Home, MessageSquare, Clock, Activity, Zap
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GA4Data {
  activeUsersNow: number;
  totalUsers30: number;
  sessions30: number;
  pageViews30: number;
  avgSessionDuration30: number;
  bounceRate30: number;
  dailyData: { date: string; users: number; sessions: number }[];
  topPages: { page: string; views: number; users: number }[];
}

interface FirestoreData {
  totalContacts: number;
  contacts30: number;
  contacts7: number;
  totalValuations: number;
  valuations30: number;
  valuations7: number;
  intentBreakdown: Record<string, number>;
  recentLeads: { name: string; email: string; intent: string; date: string }[];
}

interface DashboardData {
  ga4: GA4Data | null;
  firestore: FirestoreData | null;
  updatedAt: string;
}

// ─── Spark Bar Chart Component ───────────────────────────────────────────────

function SparkBar({ data, color = "bg-primary" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((val, i) => (
        <div
          key={i}
          className={`${color} rounded-sm flex-1 min-w-[4px] transition-all duration-300`}
          style={{ height: `${(val / max) * 100}%`, opacity: 0.4 + (val / max) * 0.6 }}
        />
      ))}
    </div>
  );
}

// ─── Stat Card Component ─────────────────────────────────────────────────────

function StatCard({
  title, value, subtitle, icon: Icon, trend, sparkData, accent = false
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  sparkData?: number[];
  accent?: boolean;
}) {
  return (
    <Card className={`card-hover border-0 shadow-md ${accent ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-10 w-10 rounded-lg ${accent ? 'bg-primary/20' : 'bg-primary/10'} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${accent ? 'text-primary' : 'text-primary'}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </div>
        <p className="text-3xl font-bold font-headline tracking-tight">{value}</p>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        {sparkData && sparkData.length > 0 && (
          <div className="mt-3">
            <SparkBar data={sparkData} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Intent Breakdown Component ──────────────────────────────────────────────

function IntentBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground truncate mr-4">{label}</span>
        <span className="font-medium tabular-nums">{count}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Password Gate Component ─────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onAuth(password);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-headline text-2xl font-bold">Ken&apos;s Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your password to view analytics</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">Incorrect password. Please try again.</p>}
            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              View Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function KenDashboard() {
  const [password, setPassword] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (pw: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (password) {
      fetchData(password);
    }
  }, [password, fetchData]);

  if (!password) {
    return <PasswordGate onAuth={setPassword} />;
  }

  const ga4 = data?.ga4;
  const fs = data?.firestore;

  // Build spark data from daily chart
  const userSpark = ga4?.dailyData?.map(d => d.users) || [];
  const sessionSpark = ga4?.dailyData?.map(d => d.sessions) || [];

  // Total leads
  const totalLeads30 = (fs?.contacts30 || 0) + (fs?.valuations30 || 0);
  const totalLeads7 = (fs?.contacts7 || 0) + (fs?.valuations7 || 0);

  // Intent breakdown total
  const intentTotal = Object.values(fs?.intentBreakdown || {}).reduce((a, b) => a + b, 0);

  // Format duration
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="font-headline text-xl font-bold text-primary">KenFinch.ca</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">Performance Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {data?.updatedAt && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Updated {new Date(data.updatedAt).toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => password && fetchData(password)}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-8">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {loading && !data && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {data && (
          <>
            {/* ─── Live Activity ──────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="font-headline text-xl font-bold">Live Activity</h2>
              </div>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Active Now"
                  value={ga4?.activeUsersNow ?? '—'}
                  subtitle="Users on site right now"
                  icon={Zap}
                  accent
                />
                <StatCard
                  title="Visitors (30d)"
                  value={ga4?.totalUsers30?.toLocaleString() ?? '—'}
                  subtitle="Unique visitors"
                  icon={Users}
                  sparkData={userSpark}
                />
                <StatCard
                  title="Page Views (30d)"
                  value={ga4?.pageViews30?.toLocaleString() ?? '—'}
                  subtitle="Total page views"
                  icon={Eye}
                  sparkData={sessionSpark}
                />
                <StatCard
                  title="Avg. Session"
                  value={ga4 ? formatDuration(ga4.avgSessionDuration30) : '—'}
                  subtitle={ga4 ? `${ga4.bounceRate30}% bounce rate` : ''}
                  icon={Clock}
                />
              </div>
            </section>

            {/* ─── Lead Generation ────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Contact className="h-5 w-5 text-primary" />
                <h2 className="font-headline text-xl font-bold">Lead Generation</h2>
              </div>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Leads (30d)"
                  value={totalLeads30}
                  subtitle={`${totalLeads7} this week`}
                  icon={TrendingUp}
                  accent
                />
                <StatCard
                  title="Contact Forms (30d)"
                  value={fs?.contacts30 ?? '—'}
                  subtitle={`${fs?.totalContacts ?? 0} all time`}
                  icon={MessageSquare}
                />
                <StatCard
                  title="AI Valuations (30d)"
                  value={fs?.valuations30 ?? '—'}
                  subtitle={`${fs?.totalValuations ?? 0} all time`}
                  icon={Home}
                />
                <StatCard
                  title="Sessions (30d)"
                  value={ga4?.sessions30?.toLocaleString() ?? '—'}
                  subtitle="Total sessions"
                  icon={Globe}
                />
              </div>
            </section>

            {/* ─── Details Row ────────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Intent Breakdown */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Lead Intent Breakdown (30d)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {fs?.intentBreakdown && Object.keys(fs.intentBreakdown).length > 0 ? (
                    Object.entries(fs.intentBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([label, count]) => (
                        <IntentBar key={label} label={label} count={count} total={intentTotal} />
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No contact form data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Top Pages (30d)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {ga4?.topPages && ga4.topPages.length > 0 ? (
                    <div className="space-y-3">
                      {ga4.topPages.map((page, i) => (
                        <div key={page.page} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                            <span className="truncate text-muted-foreground">{page.page}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 ml-4">
                            <span className="font-medium tabular-nums">{page.views.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">{page.users} users</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No page data available yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ─── Recent Leads ────────────────────────────────────── */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Contact className="h-5 w-5 text-primary" />
                  Recent Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {fs?.recentLeads && fs.recentLeads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 pr-4 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                          <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Intent</th>
                          <th className="text-left py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fs.recentLeads.map((lead, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-3 pr-4 font-medium">{lead.name}</td>
                            <td className="py-3 pr-4 text-muted-foreground hidden sm:table-cell">{lead.email}</td>
                            <td className="py-3 pr-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {lead.intent}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground hidden md:table-cell">
                              {lead.date ? new Date(lead.date).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No leads yet</p>
                )}
              </CardContent>
            </Card>

            {/* ─── Footer ─────────────────────────────────────────── */}
            <div className="text-center text-xs text-muted-foreground pt-4 pb-8">
              <p>KenFinch.ca Performance Dashboard</p>
              <p className="mt-1">Data sources: Google Analytics 4, Firebase Firestore</p>
              <p className="mt-1">Ad platform integrations (Meta Ads, Google Ads, TikTok Ads) coming soon</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
