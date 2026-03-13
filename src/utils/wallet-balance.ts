import { getWallet } from '../service/wallet'

export async function checkWalletBalance(): Promise<number> {
  const wallet = await getWallet()

  const { totalOutputs } = await wallet.listOutputs(
    { basket: '893b7646de0e1c9f741bd6e9169b76a8847ae34adef7bef1e6a285371206d2e8' }
  )
  return totalOutputs
}
