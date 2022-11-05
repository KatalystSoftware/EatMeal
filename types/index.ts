import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export enum Category {
  Breakfast,
  Lunch,
  Dinner,
  Snack,
}

export interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  category: Category;
  createdAt: Timestamp;
}

export interface PostWithUser extends Post {
  user: StrippedUser;
}
export interface StrippedUser {
  displayName: string;
  photoUrl: string;
}
