import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBeefProof } from '../services/api';
import { verifyWeatherProof, checkBeefConfirmation, VerificationResult } from '../services/verify';

/**
 * Hook for client-side blockchain verification
 */
export function useVerification(txid: string | null) {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);
  const [isCheckingConfirmation, setIsCheckingConfirmation] = useState(false);

  // Fetch BEEF proof (only when txid is available)
  const {
    data: beefData,
    isLoading: isLoadingBeef,
    error: beefError,
    refetch: refetchBeef,
  } = useQuery({
    queryKey: ['proof', txid],
    queryFn: () => fetchBeefProof(txid!),
    enabled: false, // Don't auto-fetch, triggered by verify() or checkConfirmation()
  });

  // Verify the proof
  const verify = useCallback(async () => {
    if (!txid) {
      setVerificationResult({
        verified: false,
        txid: '',
        error: 'No transaction ID available',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Fetch BEEF proof
      const { data } = await refetchBeef();

      if (!data) {
        setVerificationResult({
          verified: false,
          txid,
          error: 'Failed to fetch BEEF proof',
        });
        return;
      }

      // Verify using @bsv/sdk
      const result = await verifyWeatherProof(data.beef);
      setVerificationResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setVerificationResult({
        verified: false,
        txid,
        error: message,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [txid, refetchBeef]);

  // Check if transaction is confirmed (has merklePath) without full verification
  const checkConfirmation = useCallback(async () => {
    if (!txid) {
      setIsConfirmed(false);
      return;
    }

    setIsCheckingConfirmation(true);

    try {
      const { data } = await refetchBeef();

      if (!data) {
        setIsConfirmed(false);
        return;
      }

      const confirmed = checkBeefConfirmation(data.beef);
      setIsConfirmed(confirmed);
    } catch {
      setIsConfirmed(false);
    } finally {
      setIsCheckingConfirmation(false);
    }
  }, [txid, refetchBeef]);

  // Auto-check confirmation status when txid is available
  useEffect(() => {
    if (txid && isConfirmed === null) {
      checkConfirmation();
    }
  }, [txid, isConfirmed, checkConfirmation]);

  // Reset verification state
  const reset = useCallback(() => {
    setVerificationResult(null);
    setIsVerifying(false);
    setIsConfirmed(null);
  }, []);

  return {
    verify,
    reset,
    checkConfirmation,
    isVerifying: isVerifying || isLoadingBeef,
    isCheckingConfirmation,
    isConfirmed,
    verificationResult,
    beefData,
    beefError,
  };
}
