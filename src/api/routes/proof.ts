import { Router, Request, Response } from 'express';
import { Services } from '@bsv/wallet-toolbox-client';
import { config } from '../../config/env';

const router = Router();

// Initialize services for BEEF retrieval
const services = new Services(config.BSV_NETWORK);

/**
 * GET /api/proof/:txid
 * Get BEEF proof for a transaction
 */
router.get('/:txid', async (req: Request<{ txid: string }>, res: Response) => {
  try {
    const { txid } = req.params;

    // Validate txid format (64 hex characters)
    if (!/^[a-fA-F0-9]{64}$/.test(txid)) {
      res.status(400).json({ error: 'Invalid transaction ID format' });
      return;
    }

    // Get BEEF proof from blockchain services
    const beef = await services.getBeefForTxid(txid);

    if (!beef) {
      res.status(404).json({ error: 'BEEF proof not found for transaction' });
      return;
    }

    // Return BEEF as hex string
    res.json({
      txid,
      beef: Buffer.from(beef.toBinary()).toString('hex'),
    });
  } catch (error) {
    console.error('Error fetching BEEF proof:', error);

    // Check if it's a "not found" type error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      res.status(404).json({ error: 'Transaction not found or not yet mined' });
      return;
    }

    res.status(500).json({ error: 'Failed to fetch BEEF proof' });
  }
});

export default router;
