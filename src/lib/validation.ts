
/**
 * Basic sanitization to prevent XSS.
 * Removes <script> tags and escapes HTML entities.
 */
export const sanitize = (input: string): string => {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validates a username.
 * Rules: Alphanumeric + underscores/dashes/spaces, 3-20 characters.
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (username.length < 3) return { valid: false, error: "Username too short (min 3 chars)" };
  if (username.length > 20) return { valid: false, error: "Username too long (max 20 chars)" };
  // Allow letters, numbers, underscores, dashes, and spaces
  const regex = /^[a-zA-Z0-9_ -]+$/;
  if (!regex.test(username)) return { valid: false, error: "Invalid characters (use letters, numbers, -, _)" };
  return { valid: true };
};

/**
 * Validates a spot name.
 */
export const validateSpotName = (name: string): { valid: boolean; error?: string } => {
  const clean = name.trim();
  if (clean.length < 3) return { valid: false, error: "Name too short" };
  if (clean.length > 50) return { valid: false, error: "Name too long" };
  return { valid: true };
};