import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchVerification } from '../services/api';
import type { PaginatedResponse, WeatherRecord } from '../types/weather';

/**
 * Automatically verifies every completed, unconfirmed record in the supplied
 * list with a single backend call per effect run.
 *
 * - Collects all unique unconfirmed txids from the current page.
 * - Sends them in one POST /api/verify request — backend fans out WoC calls
 *   concurrently and persists blockHeights in a single DB transaction.
 * - Patches every cached ['weather', 'list', ...] page so the table updates
 *   without a round-trip refetch.
 * - Tracks attempted txids in a stable ref so paginating never re-fires
 *   already-checked txids within the same component lifecycle.
 */
export function useAutoVerify(records: WeatherRecord[] | undefined) {
  const queryClient = useQueryClient();
  const attempted = useRef(new Set<string>());

  const patchLists = useCallback(
    (txid: string, blockHeight: number) => {
      queryClient.setQueriesData<PaginatedResponse<WeatherRecord>>(
        { queryKey: ['weather', 'list'] },
        (old) => {
          if (!old) return old;
          if (!old.items.some((r) => r.blockchain.txid === txid)) return old;
          return {
            ...old,
            items: old.items.map((r) =>
              r.blockchain.txid === txid
                ? { ...r, blockchain: { ...r.blockchain, blockHeight } }
                : r
            ),
          };
        }
      );
    },
    [queryClient]
  );

  useEffect(() => {
    if (!records) return;

    const pending = [
      ...new Set(
        records
          .filter(
            (r) =>
              r.status === 'completed' &&
              r.blockchain.txid &&
              !r.blockchain.blockHeight &&
              !attempted.current.has(r.blockchain.txid)
          )
          .map((r) => r.blockchain.txid!)
      ),
    ];

    if (pending.length === 0) return;

    // Mark before the async call so a re-render mid-flight doesn't re-queue
    pending.forEach((txid) => attempted.current.add(txid));

    // One backend round-trip for the whole batch
    fetchVerification(pending)
      .then((results) => {
        for (const [txid, { confirmed, blockHeight }] of Object.entries(results)) {
          if (confirmed && blockHeight) {
            patchLists(txid, blockHeight);
          }
        }
      })
      .catch(() => {
        // Remove from attempted so the next render can retry
        pending.forEach((txid) => attempted.current.delete(txid));
      });
  }, [records, patchLists]);
}
