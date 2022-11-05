import * as React from "react";
import { Post, PostWithUser } from "../types";

export const PostContext = React.createContext<{
  state: PostState;
  dispatch: React.Dispatch<PostAction>;
}>({
  state: { posts: [] },
  dispatch: () => null,
});

export interface PostState {
  posts: PostWithUser[];
}
export type PostAction =
  | {
      type: "newPost";
      payload: {
        post: PostWithUser;
      };
    }
  | {
      type: "initPosts";
      payload: {
        posts: PostWithUser[];
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
        case "initPosts":
          return {
            ...prevState,
            posts: action.payload.posts,
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
