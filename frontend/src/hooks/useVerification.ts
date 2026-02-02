import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBeefProof } from '../services/api';
import { verifyWeatherProof, VerificationResult } from '../services/verify';

/**
 * Hook for client-side blockchain verification
 */
export function useVerification(txid: string | null) {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch BEEF proof (only when txid is available)
  const {
    data: beefData,
    isLoading: isLoadingBeef,
    error: beefError,
    refetch: refetchBeef,
  } = useQuery({
    queryKey: ['proof', txid],
    queryFn: () => fetchBeefProof(txid!),
    enabled: false, // Don't auto-fetch, triggered by verify()
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

  // Reset verification state
  const reset = useCallback(() => {
    setVerificationResult(null);
    setIsVerifying(false);
  }, []);

  return {
    verify,
    reset,
    isVerifying: isVerifying || isLoadingBeef,
    verificationResult,
    beefData,
    beefError,
  };
}
