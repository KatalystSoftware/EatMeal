import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "firebase/auth";

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

const Tab = createBottomTabNavigator<BottomTabParamList>();

export type LoginStackParamList = {
  Login: undefined;
};
const Stack = createNativeStackNavigator<LoginStackParamList>();

export interface AuthState {
  user: User | null;
}
export type AuthAction = {
  type: "login" | "logout";
  payload: User | null;
};
type AuthContextProviderProps = {
  children: React.ReactNode;
};
export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [state, dispatch] = React.useReducer(
    (prevState: AuthState, action: AuthAction) => {
      switch (action.type) {
        case "login":
          return { ...prevState, user: action.payload };
        case "logout":
          return { ...prevState, user: null };
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
