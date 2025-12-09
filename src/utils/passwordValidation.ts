export interface PasswordCheckResult {
  isBreached: boolean;
  isWeak: boolean;
  breachCount?: number;
  issues?: string[];
  message: string;
  apiError?: boolean;
}

export async function checkPassword(password: string): Promise<PasswordCheckResult> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-password`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('Failed to check password');
    }

    const result: PasswordCheckResult = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking password:', error);
    return {
      isBreached: false,
      isWeak: false,
      message: 'Unable to verify password security',
      apiError: true,
    };
  }
}

export function getPasswordStrengthColor(result: PasswordCheckResult | null): string {
  if (!result) return 'bg-gray-200';
  if (result.isBreached) return 'bg-red-500';
  if (result.isWeak) return 'bg-orange-500';
  return 'bg-green-500';
}

export function getPasswordStrengthText(result: PasswordCheckResult | null): string {
  if (!result) return 'Enter a password';
  if (result.isBreached) return 'Breached - Choose a different password';
  if (result.isWeak) return 'Weak - Please strengthen your password';
  return 'Strong password';
}
