import type { User } from "../types";

const USERS_KEY = "iip_users";
const SESSION_KEY = "iip_session";

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function getSessionUser(): User | null {
  const id = getSessionUserId();
  if (!id) return null;
  return readUsers().find((u) => u.id === id) ?? null;
}

export function signUp(user: Omit<User, "id" | "createdAt">): User {
  const users = readUsers();
  const exists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (exists) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  const newUser: User = {
    ...user,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, newUser.id);
  return newUser;
}

export function signIn(email: string, password: string): User {
  const user = readUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function saveInvestmentForm(userId: string, form: unknown): void {
  localStorage.setItem(`iip_form_${userId}`, JSON.stringify(form));
}

export function loadInvestmentForm<T>(userId: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`iip_form_${userId}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
