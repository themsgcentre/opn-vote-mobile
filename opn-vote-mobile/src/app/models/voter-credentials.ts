import { ethers } from "ethers";
import { Signature } from "./signature";
import { Token } from "./token";
import { EncryptionKey } from "./encryption-key";


export interface VoterCredentials {
    unblindedSignature: Signature,
    unblindedElectionToken: Token,
    voterWallet: ethers.Wallet,
    encryptionKey: EncryptionKey,
    electionId: number
}