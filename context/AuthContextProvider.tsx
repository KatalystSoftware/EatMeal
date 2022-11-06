import * as React from "react";
import { User } from "firebase/auth";
import { UserStats } from "../types";
import { BannerContext } from "./BannerContextProvider";

export const AuthContext = React.createContext<{
  state: AuthState;
  dispatch: React.Dispatch<any>;
}>({
  state: { user: null },
  dispatch: () => null,
});

export type BottomTabParamList = {
  Home: undefined;
  Profile: undefined;
};

export interface AuthState {
  user: User | null;
  stats?: UserStats;
}
export type AuthAction =
  | {
      type: "login" | "logout";
      payload: User | null;
    }
  | {
      type: "setStats";
      payload: UserStats;
    };

type AuthContextProviderProps = {
  children: React.ReactNode;
};

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const bannerContext = React.useContext(BannerContext);
  const [state, dispatch] = React.useReducer(
    (prevState: AuthState, action: AuthAction) => {
      switch (action.type) {
        case "login":
          return { ...prevState, user: action.payload };
        case "logout":
          return { ...prevState, user: null };
        case "setStats": {
          return { ...prevState, stats: action.payload };
        }
      }
    },
    {
      user: null,
    },
  );

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}
