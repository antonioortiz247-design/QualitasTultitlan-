export type AnalyticsEvent = 'hero_quote_click'|'whatsapp_click'|'quote_started'|'quote_step_1_completed'|'quote_step_2_completed'|'quote_completed'|'footer_lead_started'|'footer_lead_completed'|'coverage_cta_click'|'phone_click';
export function trackEvent(event: AnalyticsEvent, params?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV === 'development') console.info('[analytics:demo]', event, params ?? {});
}
