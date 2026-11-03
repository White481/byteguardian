"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/types";

const SessionContext = createContext<SessionUser | null>(null);

/** Makes the signed-in user (loaded by the server layout) available to client pages */
export function SessionProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useSession must be used inside the (app) layout");
  return user;
}

/** Viewers are read-only */
export function useCanEdit() {
  return useSession().role !== "viewer";
}
