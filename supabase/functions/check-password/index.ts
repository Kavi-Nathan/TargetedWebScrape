import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: "Password is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check password strength
    const strengthIssues = [];
    if (password.length < 12) {
      strengthIssues.push("Password must be at least 12 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      strengthIssues.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      strengthIssues.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      strengthIssues.push("Password must contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      strengthIssues.push("Password must contain at least one special character");
    }

    // Common weak passwords
    const commonPasswords = [
      'password', 'password123', '12345678', 'qwerty', 'abc123',
      'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
      'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
      'welcome', 'admin', 'root', '123456789', '12345678910'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      strengthIssues.push("This password is too common and easily guessed");
    }

    if (strengthIssues.length > 0) {
      return new Response(
        JSON.stringify({
          isBreached: false,
          isWeak: true,
          issues: strengthIssues
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Hash password with SHA-1
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Check against HaveIBeenPwned API using k-anonymity
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "Add-Padding": "true",
        },
      }
    );

    if (!response.ok) {
      console.error("HaveIBeenPwned API error:", response.status);
      // If API is down, still allow signup but warn
      return new Response(
        JSON.stringify({
          isBreached: false,
          isWeak: false,
          apiError: true,
          message: "Unable to check password breach status, but password meets strength requirements"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const text = await response.text();
    const hashes = text.split('\n');

    // Check if our hash suffix appears in the response
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return new Response(
          JSON.stringify({
            isBreached: true,
            isWeak: false,
            breachCount: parseInt(count.trim()),
            message: "This password has been exposed in a data breach"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Password is safe
    return new Response(
      JSON.stringify({
        isBreached: false,
        isWeak: false,
        message: "Password is secure"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error checking password:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});