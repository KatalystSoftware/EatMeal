import * as React from "react";
import { User } from "firebase/auth";
import { Post } from "../types";

export const PostContext = React.createContext<{
  state: PostState;
  dispatch: React.Dispatch<any>;
}>({
  state: { posts: [] },
  dispatch: () => null,
});

export interface PostState {
  posts: Post[];
}
export type PostAction = {
  type: "newPost";
  payload: {
    post: Post;
    user: User;
  };
};

type PostContextProviderProps = {
  children: React.ReactNode;
};
export default function PostContextProvider({
  children,
}: PostContextProviderProps) {
  const [state, dispatch] = React.useReducer(
    (prevState: PostState, action: PostAction) => {
      switch (action.type) {
        case "newPost":
          return {
            ...prevState,
            posts: [...prevState.posts, action.payload.post],
          };
      }
    },
    {
      posts: [],
    },
  );

  return (
    <PostContext.Provider value={{ state, dispatch }}>
      {children}
    </PostContext.Provider>
  );
}
