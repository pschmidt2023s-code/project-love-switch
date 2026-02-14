/**
 * GDPR Right-to-Delete Pipeline
 * Handles user data deletion requests per Art. 17 DSGVO
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from './correlation';

export interface DeletionResult {
  table: string;
  deleted: number;
  error?: string;
}

/**
 * Execute GDPR Right-to-Delete for a user
 * Deletes all PII while preserving anonymized transaction records
 */
export async function executeRightToDelete(userId: string): Promise<{
  success: boolean;
  results: DeletionResult[];
  errors: string[];
}> {
  const results: DeletionResult[] = [];
  const errors: string[] = [];

  logger.info('Starting GDPR deletion', 'gdpr', { userId });

  // Tables to fully delete user data from
  const deletionTables = [
    { table: 'wishlist', column: 'user_id' },
    { table: 'cart_items', column: 'user_id' },
    { table: 'addresses', column: 'user_id' },
    { table: 'stock_notifications', column: 'user_id' },
    { table: 'csat_surveys', column: 'user_id' },
    { table: 'payback_earnings', column: 'user_id' },
    { table: 'payback_payouts', column: 'user_id' },
    { table: 'referral_codes', column: 'user_id' },
  ] as const;

  for (const { table, column } of deletionTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq(column, userId)
        .select('id');

      if (error) {
        errors.push(`${table}: ${error.message}`);
        results.push({ table, deleted: 0, error: error.message });
      } else {
        results.push({ table, deleted: data?.length || 0 });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${table}: ${msg}`);
      results.push({ table, deleted: 0, error: msg });
    }
  }

  // Anonymize profile (keep record but strip PII)
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: 'GELÖSCHT',
        last_name: 'GELÖSCHT',
        email: `deleted_${userId.slice(0, 8)}@anonym.local`,
        phone: null,
        avatar_url: null,
      })
      .eq('id', userId);

    if (error) {
      errors.push(`profiles: ${error.message}`);
      results.push({ table: 'profiles', deleted: 0, error: error.message });
    } else {
      results.push({ table: 'profiles', deleted: 1 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`profiles: ${msg}`);
  }

  // Anonymize tickets (keep for support records)
  try {
    const { data, error } = await supabase
      .from('tickets')
      .update({
        customer_name: 'Gelöschter Nutzer',
        customer_email: 'deleted@anonym.local',
      })
      .eq('user_id', userId)
      .select('id');

    results.push({ table: 'tickets', deleted: data?.length || 0, error: error?.message });
  } catch (e) {
    errors.push(`tickets: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Anonymize reviews
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ author_name: 'Anonym' })
      .eq('user_id', userId)
      .select('id');

    results.push({ table: 'reviews', deleted: data?.length || 0, error: error?.message });
  } catch (e) {
    errors.push(`reviews: ${e instanceof Error ? e.message : String(e)}`);
  }

  logger.info('GDPR deletion completed', 'gdpr', { 
    userId, 
    totalDeleted: results.reduce((s, r) => s + r.deleted, 0),
    errorCount: errors.length 
  });

  return {
    success: errors.length === 0,
    results,
    errors,
  };
}
