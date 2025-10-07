import { NextResponse } from 'next/server';
import { getReportStats } from '@/actions/reportsActions';

export async function GET() {
  try {
    const stats = await getReportStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'reports_failed' }, { status: 500 });
  }
}
