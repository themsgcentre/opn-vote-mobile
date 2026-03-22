import { ethers } from "ethers"
import { VotingTransaction } from "../interfaces/voting-transaction"
import { custom } from "viem"

export function createVoteCalldata(
  votingTransaction: VotingTransaction,
  opnVoteABI: ethers.Interface | ethers.InterfaceAbi,
): string {
  const svsSignatureHex = votingTransaction.svsSignature
    ? votingTransaction.svsSignature.hexString
    : '0x'
  const iface =
    opnVoteABI instanceof ethers.Interface ? opnVoteABI : new ethers.Interface(opnVoteABI)
  return iface.encodeFunctionData('vote', [
    votingTransaction.electionID,
    votingTransaction.voterAddress,
    svsSignatureHex,
    votingTransaction.encryptedVoteRSA.hexString,
    votingTransaction.encryptedVoteAES.hexString,
    votingTransaction.unblindedElectionToken.hexString,
    votingTransaction.unblindedSignature.hexString,
  ])
}

export function createSvsForwardTransport(svsUrl: string) {
  return custom({
    async request({ method, params }: { method: string; params: unknown[] }) {
      const res = await fetch(`${svsUrl}/api/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      })
      const json = (await res.json()) as any
      if (!res.ok || json.error)
        throw new Error(`SVS forward [${res.status}]: ${json.error ?? JSON.stringify(json)}`)
      const bundlerResponse = json.data
      if (bundlerResponse.error)
        throw new Error(`Bundler error: ${JSON.stringify(bundlerResponse.error)}`)
      return bundlerResponse.result
    },
  })
}