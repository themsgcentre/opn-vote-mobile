import { UrlPaths } from "../globals/url-paths";
import { VotingTransaction } from "../interfaces/voting-transaction";
import { EthSignature } from "./eth-signature";
import { ServerError } from "./server-error";

export async function signTransaction(votingTransaction: VotingTransaction, voterSignatureObject: EthSignature) {
    const signHeader = new Headers();
    signHeader.append("Content-Type", "application/json");

    const signOptions = {
        method: "POST",
        headers: signHeader,
        body: JSON.stringify({ votingTransaction, voterSignature: voterSignatureObject }),
    };

    const response = await fetch(UrlPaths.signVotingTransactionUrl, signOptions);
    if (response.status !== 200) {
        throw new ServerError();
    }
    const jsondata = await response.json();
    if (jsondata?.data?.blindedSignature) {
        return jsondata.data.blindedSignature;
    }
    if (jsondata?.data?.hexString) {
        return jsondata.data;
    }
    return jsondata;
};