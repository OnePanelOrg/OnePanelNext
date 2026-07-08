import {
  ClerkProvider,
  Show as ClerkShow,
  SignIn as ClerkSignIn,
  SignInButton as ClerkSignInButton,
  SignUp as ClerkSignUp,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
  useAuth as useClerkAuth,
  useUser,
} from "@clerk/nextjs";
import React, { createContext, useContext, type ReactElement } from "react";
import { env } from "../env/client.mjs";

type AuthValue = {
  getToken: () => Promise<string | null>;
  isLoaded: boolean;
  isSignedIn: boolean;
};

type AuthButtonProps = {
  children: ReactElement<{ onClick?: () => void; title?: string }>;
  mode?: "modal" | "redirect";
  fallbackRedirectUrl?: string | null;
  forceRedirectUrl?: string | null;
  signInFallbackRedirectUrl?: string | null;
  signInForceRedirectUrl?: string | null;
  signUpFallbackRedirectUrl?: string | null;
  signUpForceRedirectUrl?: string | null;
};

type AuthGateProps = {
  children: React.ReactNode;
  when: "signed-in" | "signed-out";
};

type AuthProviderProps = {
  children: React.ReactNode;
  pageProps: Record<string, unknown>;
};

const mockAuth: AuthValue = {
  getToken: async () => null,
  isLoaded: true,
  isSignedIn: false,
};

const READER_REDIRECT_URL = "/reader";
const SIGN_IN_URL = "/sign-in";
const SIGN_UP_URL = "/sign-up";

const AuthContext = createContext<AuthValue>(mockAuth);

function isValidPublishableKey(key: string) {
  if (!key.startsWith("pk_test_") && !key.startsWith("pk_live_")) {
    return false;
  }

  const encoded = key.split("_")[2];
  if (!encoded) return false;

  try {
    const decoded = globalThis.atob(encoded);
    const withoutTrailing = decoded.endsWith("$") ? decoded.slice(0, -1) : "";
    return Boolean(withoutTrailing && withoutTrailing.includes("."));
  } catch {
    return false;
  }
}

export const isClerkConfigured = isValidPublishableKey(
  env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useClerkAuth();

  return (
    <AuthContext.Provider value={{ getToken, isLoaded, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children, pageProps }: AuthProviderProps) {
  if (!isClerkConfigured) {
    return (
      <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
    );
  }

  return (
    <ClerkProvider
      {...pageProps}
      signInUrl={SIGN_IN_URL}
      signUpUrl={SIGN_UP_URL}
      fallbackRedirectUrl={READER_REDIRECT_URL}
    >
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

function DisabledAuthButton({ children }: AuthButtonProps) {
  return React.cloneElement(children, {
    onClick: () => {
      window.alert(
        "Configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to use authentication.",
      );
    },
    title: "Configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable auth",
  });
}

export function SignInButton({
  children,
  fallbackRedirectUrl = READER_REDIRECT_URL,
  forceRedirectUrl,
  mode = "redirect",
  signUpFallbackRedirectUrl = READER_REDIRECT_URL,
  signUpForceRedirectUrl,
}: AuthButtonProps) {
  if (!isClerkConfigured) {
    return <DisabledAuthButton mode={mode}>{children}</DisabledAuthButton>;
  }

  return (
    <ClerkSignInButton
      fallbackRedirectUrl={fallbackRedirectUrl}
      forceRedirectUrl={forceRedirectUrl}
      mode={mode}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
      signUpForceRedirectUrl={signUpForceRedirectUrl}
    >
      {children}
    </ClerkSignInButton>
  );
}

export function SignUpButton({
  children,
  fallbackRedirectUrl = READER_REDIRECT_URL,
  forceRedirectUrl,
  mode = "redirect",
  signInFallbackRedirectUrl = READER_REDIRECT_URL,
  signInForceRedirectUrl,
}: AuthButtonProps) {
  if (!isClerkConfigured) {
    return <DisabledAuthButton mode={mode}>{children}</DisabledAuthButton>;
  }

  return (
    <ClerkSignUpButton
      fallbackRedirectUrl={fallbackRedirectUrl}
      forceRedirectUrl={forceRedirectUrl}
      mode={mode}
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signInForceRedirectUrl={signInForceRedirectUrl}
    >
      {children}
    </ClerkSignUpButton>
  );
}

export function SignInPage() {
  if (!isClerkConfigured) return null;

  return (
    <ClerkSignIn
      fallbackRedirectUrl={READER_REDIRECT_URL}
      path={SIGN_IN_URL}
      routing="path"
      signUpUrl={SIGN_UP_URL}
    />
  );
}

export function SignUpPage() {
  if (!isClerkConfigured) return null;

  return (
    <ClerkSignUp
      fallbackRedirectUrl={READER_REDIRECT_URL}
      path={SIGN_UP_URL}
      routing="path"
      signInUrl={SIGN_IN_URL}
    />
  );
}

export function UserButton() {
  if (!isClerkConfigured) return null;
  return <ClerkUserButton />;
}

function ClerkUserName() {
  const { user } = useUser();
  const name =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    null;

  if (!name) return null;

  return (
    <span className="hidden max-w-[12rem] truncate text-sm font-semibold text-gray-700 sm:inline">
      {name}
    </span>
  );
}

export function UserName() {
  if (!isClerkConfigured) return null;
  return <ClerkUserName />;
}

export function Show({ children, when }: AuthGateProps) {
  const { isSignedIn } = useContext(AuthContext);

  if (!isClerkConfigured) {
    return when === "signed-out" && !isSignedIn ? <>{children}</> : null;
  }

  return <ClerkShow when={when}>{children}</ClerkShow>;
}

export function useAuth() {
  return useContext(AuthContext);
}
