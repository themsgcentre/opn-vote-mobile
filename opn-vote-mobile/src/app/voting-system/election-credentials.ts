import { ethers } from "ethers";
import { Token } from "./token";
import { Signature } from "./signature";
import { EncryptionKey } from "./encryption-key";

export type ElectionCredentials = {
    unblindedSignature: Signature;
    unblindedElectionToken: Token;
    voterWallet: ethers.Wallet;
    encryptionKey: EncryptionKey;
    electionID: number;
};