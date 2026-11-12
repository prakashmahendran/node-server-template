import { Transaction } from 'sequelize';
import { Audit } from './models';

/**
 * Run several database writes atomically: everything inside `work` is committed together,
 * or rolled back if any step throws (e.g. a write and its audit entry).
 */
export async function withTransaction<T>(
  work: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const client = Audit.sequelize;
  if (!client) throw new Error('Database has not been initialized');
  return client.transaction(work);
}
