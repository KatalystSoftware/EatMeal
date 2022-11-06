import * as React from "react";
import { Achievement } from "../types";

export const BannerContext = React.createContext<{
  state: BannerState;
  dispatch: React.Dispatch<any>;
}>({
  state: { banner: null },
  dispatch: () => null,
});

export interface BannerState {
  banner: Achievement | null;
}
export type BannerAction =
  | {
      type: "setBanner";
      payload: Achievement | null;
    }
  | {
      type: "dismissBanner";
    };

type BannerContextProviderProps = {
  children: React.ReactNode;
};

export default function BannerContextProvider({
  children,
}: BannerContextProviderProps) {
  const [state, dispatch] = React.useReducer(
    (prevState: BannerState, action: BannerAction) => {
      switch (action.type) {
        case "setBanner":
          return { ...prevState, banner: action.payload };
        case "dismissBanner":
          return { ...prevState, banner: null };
      }
    },
    {
      banner: null,
    },
  );

  return (
    <BannerContext.Provider value={{ state, dispatch }}>
      {children}
    </BannerContext.Provider>
  );
}
