import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { checkWalletBalance } from '../../utils/wallet-balance'

// routes/ready/index.ts - combined check (wallet + db)
export async function readyProbe(_req: Request, res: Response): Promise<void> {
  const { MIN_BALANCE } = process.env
  try {
    const balance = await checkWalletBalance()
    if (balance < parseInt(MIN_BALANCE!)) throw new Error('Insufficient wallet balance')
    await mongoose.connection.db!.command({ ping: 1 })
    res.status(200).json({ status: 'ready' })
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: (err as Error).message })
  }
}
