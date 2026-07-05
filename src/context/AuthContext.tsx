import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  getSessionUser,
  loadInvestmentForm,
  saveInvestmentForm,
  signIn as storageSignIn,
  signOut as storageSignOut,
  signUp as storageSignUp,
} from "../storage/authStorage";
import type { InvestmentFormData, User } from "../types";
import { DEFAULT_INVESTMENT_FORM } from "../types";
import { getCountryPack } from "../data/countries";

interface AuthContextValue {
  user: User | null;
  investmentForm: InvestmentFormData;
  setInvestmentForm: React.Dispatch<React.SetStateAction<InvestmentFormData>>;
  signUp: (input: Omit<User, "id" | "createdAt">) => void;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function withDefaultRetirementAge(form: InvestmentFormData, sessionUser: User | null): InvestmentFormData {
  if (form.retirementAge || !sessionUser) return form;
  const pack = getCountryPack(sessionUser.countryCode);
  return { ...form, retirementAge: String(pack?.defaultRetirementAge ?? 60) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSessionUser());
  const [investmentForm, setInvestmentFormState] = useState<InvestmentFormData>(() => {
    const sessionUser = getSessionUser();
    if (!sessionUser) return DEFAULT_INVESTMENT_FORM;
    const loaded = loadInvestmentForm(sessionUser.id, DEFAULT_INVESTMENT_FORM);
    return withDefaultRetirementAge(loaded, sessionUser);
  });

  const setInvestmentForm: React.Dispatch<React.SetStateAction<InvestmentFormData>> = useCallback(
    (action) => {
      setInvestmentFormState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        const sessionUser = getSessionUser();
        if (sessionUser) saveInvestmentForm(sessionUser.id, next);
        return next;
      });
    },
    [],
  );

  const signUp = useCallback((input: Omit<User, "id" | "createdAt">) => {
    const newUser = storageSignUp(input);
    const pack = getCountryPack(newUser.countryCode);
    const form: InvestmentFormData = {
      ...DEFAULT_INVESTMENT_FORM,
      retirementAge: String(pack?.defaultRetirementAge ?? 60),
    };
    saveInvestmentForm(newUser.id, form);
    setUser(newUser);
    setInvestmentFormState(form);
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const loggedIn = storageSignIn(email, password);
    const loaded = loadInvestmentForm(loggedIn.id, DEFAULT_INVESTMENT_FORM);
    setUser(loggedIn);
    setInvestmentFormState(withDefaultRetirementAge(loaded, loggedIn));
  }, []);

  const signOut = useCallback(() => {
    storageSignOut();
    setUser(null);
    setInvestmentFormState(DEFAULT_INVESTMENT_FORM);
  }, []);

  const value = useMemo(
    () => ({
      user,
      investmentForm,
      setInvestmentForm,
      signUp,
      signIn,
      signOut,
    }),
    [user, investmentForm, setInvestmentForm, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
