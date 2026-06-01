import { SignJWT, jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.APPROVAL_TOKEN_SECRET ?? "noagency-approval-secret-dev-only"
)

export interface ApprovalPayload {
  clientId: string
  batchId: string
  type: "approval"
}

export async function createApprovalToken(payload: ApprovalPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET)
}

export async function verifyApprovalToken(token: string): Promise<ApprovalPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as ApprovalPayload
  } catch {
    return null
  }
}
