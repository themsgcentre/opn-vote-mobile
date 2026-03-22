import { ethers } from "ethers";
import { Signature } from "../voting-system/signature";
import { EncryptionType } from "../voting-system/encryption-type";
import { Token } from "../voting-system/token";
import { EncryptionKey } from "../voting-system/encryption-key";


export interface VoterCredentials {
    unblindedSignature: Signature,
    unblindedElectionToken: Token,
    voterWallet: ethers.Wallet,
    encryptionKey: EncryptionKey,
    electionId: number
}