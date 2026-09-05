import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import admin from 'firebase-admin';
import { listLeads } from '@/lib/leads/store';
import { attributionLabel } from '@/lib/attribution';

// Simple password check
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'kenfinch2026';

// Initialize Firebase Admin SDK (server-side)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminDb = admin.firestore();

// ─── GA4 Data API ────────────────────────────────────────────────────────────

interface GA4Row {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
}

async function getGA4Data() {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
    const property = 'properties/502989110';

    const [realtime, last30, last7, topPagesReport] = await Promise.all([
      analyticsData.properties.runRealtimeReport({
        property,
        requestBody: {
          metrics: [{ name: 'activeUsers' }],
        },
      }).catch(() => null),

      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'totalUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
          ],
        },
      }).catch(() => null),

      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'totalUsers' },
            { name: 'sessions' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        },
      }).catch(() => null),

      analyticsData.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: '10',
        },
      }).catch(() => null),
    ]);

    // Parse realtime
    const realtimeRows = (realtime?.data as { rows?: GA4Row[] })?.rows;
    const activeUsersNow = realtimeRows?.[0]?.metricValues?.[0]?.value || '0';

    // Parse 30-day overview
    const last30Rows = (last30?.data as { rows?: GA4Row[] })?.rows;
    const overview30 = last30Rows?.[0]?.metricValues || [];
    const totalUsers30 = overview30[0]?.value || '0';
    const sessions30 = overview30[1]?.value || '0';
    const pageViews30 = overview30[2]?.value || '0';
    const avgSessionDuration30 = parseFloat(overview30[3]?.value || '0');
    const bounceRate30 = parseFloat(overview30[4]?.value || '0');

    // Parse 7-day chart data
    const last7Rows = (last7?.data as { rows?: GA4Row[] })?.rows || [];
    const dailyData = last7Rows.map((row: GA4Row) => ({
      date: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    }));

    // Parse top pages
    const topPagesRows = (topPagesReport?.data as { rows?: GA4Row[] })?.rows || [];
    const topPages = topPagesRows.map((row: GA4Row) => ({
      page: row.dimensionValues?.[0]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    }));

    return {
      activeUsersNow: parseInt(activeUsersNow),
      totalUsers30: parseInt(totalUsers30),
      sessions30: parseInt(sessions30),
      pageViews30: parseInt(pageViews30),
      avgSessionDuration30: Math.round(avgSessionDuration30),
      bounceRate30: Math.round(bounceRate30 * 100),
      dailyData,
      topPages,
    };
  } catch (error) {
    console.error('GA4 API error:', error);
    return null;
  }
}

// ─── Firestore Data ──────────────────────────────────────────────────────────

async function getFirestoreData() {
  try {
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Unified pipeline: every form writes to `leads` with a `type`.
    const leads = await listLeads(500);
    const count = (type: string, since?: string) =>
      leads.filter((l) => l.type === type && (!since || l.createdAt >= since)).length;

    const intentCounts: Record<string, number> = {};
    leads
      .filter((l) => l.createdAt >= thirtyDaysAgo)
      .forEach((l) => {
        const intent =
          l.type === 'contact'
            ? ((l.details as Record<string, string>).intent || 'Not specified')
            : l.type === 'buyer'
              ? `Mortgage: ${(l.details as Record<string, string>).goal || 'buyer'}`
              : l.type === 'valuation'
                ? 'Valuation expert opinion'
                : 'Email capture';
        intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      });

    const sourceBreakdown: Record<string, number> = {};
    leads
      .filter((l) => l.createdAt >= thirtyDaysAgo)
      .forEach((l) => {
        const k = attributionLabel(l.attribution);
        sourceBreakdown[k] = (sourceBreakdown[k] || 0) + 1;
      });

    const recentLeads = leads.slice(0, 8).map((l) => ({
      name: l.name,
      email: l.email,
      intent: l.summary || l.type,
      type: l.type,
      status: l.status,
      date: l.createdAt,
    }));

    return {
      totalContacts: count('contact'),
      contacts30: count('contact', thirtyDaysAgo),
      contacts7: count('contact', sevenDaysAgo),
      totalValuations: count('valuation'),
      valuations30: count('valuation', thirtyDaysAgo),
      valuations7: count('valuation', sevenDaysAgo),
      totalBuyerLeads: count('buyer'),
      buyerLeads30: count('buyer', thirtyDaysAgo),
      buyerLeads7: count('buyer', sevenDaysAgo),
      totalPopups: count('popup'),
      popups30: count('popup', thirtyDaysAgo),
      intentBreakdown: intentCounts,
      sourceBreakdown,
      recentLeads,
    };
  } catch (error) {
    console.error('Firestore error:', error);
    return null;
  }
}

// ─── API Route ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.password !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [ga4, firestore] = await Promise.all([
      getGA4Data(),
      getFirestoreData(),
    ]);

    return NextResponse.json({
      ga4,
      firestore,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
