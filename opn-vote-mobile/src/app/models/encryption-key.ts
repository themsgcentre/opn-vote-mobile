import { EncryptionType } from "./encryption-type";

export type EncryptionKey = {
    hexString: string;
    encryptionType: EncryptionType;
};