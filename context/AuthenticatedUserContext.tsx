import * as React from "react";
import { User } from "firebase/auth";

export type AuthenticatedUserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};
export const AuthenticatedUserContext =
  React.createContext<AuthenticatedUserContextType | null>(null);

interface AuthenticatedUserProviderProps {
  children: React.ReactNode;
}
export const AuthenticatedUserProvider: React.FC<
  AuthenticatedUserProviderProps
> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
