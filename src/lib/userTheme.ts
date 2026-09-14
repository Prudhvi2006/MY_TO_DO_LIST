export const ROHIT_USERS = [
  'pardhupavan456@gmail.com',
  'navadhanushka474@gmail.com',
];

export const isRohitUser = (email?: string | null): boolean => {
  if (!email) return false;
  const userEmail = email.trim().toLowerCase();
  return ROHIT_USERS.includes(userEmail);
};

// Backward-compatible alias for existing components
export const isSpecialUser = isRohitUser;

// Only enable astronaut celebration if specifically requested (disabled by default)
export const isSpecialAstronautUser = (_email?: string | null): boolean => false;

