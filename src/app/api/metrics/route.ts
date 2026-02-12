import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/metrics
 * Returns aggregated analytics from Supabase
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get total page views
    const { count: pageViews } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'page_view');

    // Get total downloads
    const { count: downloads } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'resume_download');

    // Get downloads by template (optional, for future use)
    const { data: byTemplate } = await supabase
      .from('analytics')
      .select('metadata')
      .eq('event_type', 'resume_download');

    const templateCounts = byTemplate?.reduce((acc: Record<string, number>, row) => {
      const template = row.metadata?.template || 'unknown';
      acc[template] = (acc[template] || 0) + 1;
      return acc;
    }, {});

    return Response.json({
      page_hits: pageViews || 0,
      resume_downloads: downloads || 0,
      by_template: templateCounts || {},
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    // Return zeros on error to avoid breaking the UI
    return Response.json({
      page_hits: 0,
      resume_downloads: 0,
      by_template: {},
    });
  }
}

