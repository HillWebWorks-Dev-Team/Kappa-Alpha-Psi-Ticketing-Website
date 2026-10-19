/** Documented default when ADMIN_PASSWORD is unset (local / preview). */
const DEFAULT_ADMIN_PASSWORD = "kappaadmin@2026";

export function getExpectedAdminPassword(): string {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_ADMIN_PASSWORD;
}

export function isValidAdminPassword(password: string): boolean {
  const expected = getExpectedAdminPassword();
  return Boolean(password) && password === expected;
}
