import { User } from "firebase/auth";

export type Category = "breakfast" | "lunch" | "dinner" | "snack";

export interface Post {
  id: number;
  photo: string;
  caption: string;
  category: Category;
  user: User;
}
