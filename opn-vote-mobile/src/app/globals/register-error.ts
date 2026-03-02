import { RegisterErrorType } from "./register-error.type";

export class RegisterError extends Error {
  constructor(public type: RegisterErrorType) {
    super(type);
  }
}