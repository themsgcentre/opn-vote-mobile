import { createSign } from 'node:crypto'

export function createJwt(payload: object, rsaPrivKeyPem: string): string {
  const b64url = (s: string) => Buffer.from(s).toString('base64url')
  const header = { alg: 'RS256', typ: 'JWT' }
  const sigInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`
  const sign = createSign('RSA-SHA256')
  sign.update(sigInput)
  return `${sigInput}.${sign.sign(rsaPrivKeyPem, 'base64url')}`
}

// TODO: only for testing, replace later
export function createPayload(electionId: number) {
    const voterId = Date.now()
    return { electionId: electionId, voterId: voterId }
}