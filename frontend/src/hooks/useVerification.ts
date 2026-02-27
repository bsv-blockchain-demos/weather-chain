import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchVerification } from '../services/api';
import type { VerificationResult } from '../services/verify';
import type { WeatherRecord } from '../types/weather';

/**
 * Hook for blockchain verification of a weather transaction.
 *
 * On confirmation:
 * - blockHeight is persisted to the DB by the backend (inside a MongoDB
 *   transaction, so concurrent verify calls are safe).
 * - The detail record in React Query cache is patched immediately so the UI
 *   updates without waiting for a round-trip refetch.
 * - All weather list queries are invalidated so the station records page shows
 *   the updated blockHeight on its next mount/visit.
 */
export function useVerification(txid: string | null, recordId: string | undefined) {
  const queryClient = useQueryClient();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);
  const [isCheckingConfirmation, setIsCheckingConfirmation] = useState(false);

  // Patch the detail cache and stale-mark all weather lists so the station
  // records page gets fresh data on its next visit.
  const applyBlockHeightToCache = useCallback(
    (blockHeight: number) => {
      if (recordId) {
        queryClient.setQueryData<WeatherRecord>(
          ['weather', 'detail', recordId],
          (old) => {
            if (!old) return old;
            return { ...old, blockchain: { ...old.blockchain, blockHeight } };
          }
        );
      }
      // Mark every weather list stale — next visit to StationRecords refetches
      queryClient.invalidateQueries({ queryKey: ['weather', 'list'] });
    },
    [recordId, queryClient]
  );

  // Lightweight confirmation check: just sets isConfirmed, no verificationResult
  const checkConfirmation = useCallback(async () => {
    if (!txid) {
      setIsConfirmed(false);
      return;
    }

    setIsCheckingConfirmation(true);

    try {
      const results = await fetchVerification([txid]);
      const { confirmed, blockHeight } = results[txid] ?? { confirmed: false, blockHeight: null };
      setIsConfirmed(confirmed);
      if (confirmed && blockHeight) {
        applyBlockHeightToCache(blockHeight);
      }
    } catch {
      setIsConfirmed(false);
    } finally {
      setIsCheckingConfirmation(false);
    }
  }, [txid, applyBlockHeightToCache]);

  // Full verify: same request, but surfaces the result in verificationResult
  const verify = useCallback(async () => {
    if (!txid) {
      setVerificationResult({ verified: false, txid: '', error: 'No transaction ID available' });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const results = await fetchVerification([txid]);
      const { confirmed, blockHeight } = results[txid] ?? { confirmed: false, blockHeight: null };
      setVerificationResult({
        verified: confirmed,
        txid,
        blockHeight: blockHeight ?? undefined,
        error: confirmed ? undefined : 'Transaction not yet confirmed on chain',
      });
      setIsConfirmed(confirmed);
      if (confirmed && blockHeight) {
        applyBlockHeightToCache(blockHeight);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setVerificationResult({ verified: false, txid, error: message });
    } finally {
      setIsVerifying(false);
    }
  }, [txid, applyBlockHeightToCache]);

  // Auto-check on mount whenever a txid becomes available
  useEffect(() => {
    if (txid && isConfirmed === null) {
      checkConfirmation();
    }
  }, [txid, isConfirmed, checkConfirmation]);

  const reset = useCallback(() => {
    setVerificationResult(null);
    setIsVerifying(false);
    setIsConfirmed(null);
  }, []);

  return {
    verify,
    reset,
    checkConfirmation,
    isVerifying,
    isCheckingConfirmation,
    isConfirmed,
    verificationResult,
  };
}
