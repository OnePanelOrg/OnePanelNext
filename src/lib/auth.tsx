import {
  ClerkProvider,
  Show as ClerkShow,
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
  useAuth as useClerkAuth,
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

const AuthContext = createContext<AuthValue>(mockAuth);

function isValidPublishableKey(key: string) {
  if (!key.startsWith("pk_test_") && !key.startsWith("pk_live_")) {
    return false;
  }

  const encoded = key.split("_")[2];
  if (!encoded) return false;

  try {
    const decoded = globalThis.atob(encoded);
    const withoutTrailing = decoded.endsWith("$")
      ? decoded.slice(0, -1)
      : "";
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
    <ClerkProvider {...pageProps}>
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

export function SignInButton(props: AuthButtonProps) {
  if (!isClerkConfigured) return <DisabledAuthButton {...props} />;
  return <ClerkSignInButton {...props} />;
}

export function SignUpButton(props: AuthButtonProps) {
  if (!isClerkConfigured) return <DisabledAuthButton {...props} />;
  return <ClerkSignUpButton {...props} />;
}

export function UserButton() {
  if (!isClerkConfigured) return null;
  return <ClerkUserButton />;
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
