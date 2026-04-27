import { R } from "./r";
import { Token } from "./token";

export interface MasterKey {
  masterToken: Token;
  masterR: R;
}