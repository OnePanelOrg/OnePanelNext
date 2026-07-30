export const SIGN_IN_REQUIRED_CODE = "sign_in_required";

export function isChapterSignInRequired(error, isSignedIn) {
  if (isSignedIn || !error || typeof error !== "object") return false;

  return (
    error.code === SIGN_IN_REQUIRED_CODE ||
    (error.status === 401 && error.code == null)
  );
}
