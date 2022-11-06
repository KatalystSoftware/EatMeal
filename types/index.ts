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
  labels?: string[];
}

export interface PostWithUser extends Post {
  user: StrippedUser;
}
export interface StrippedUser {
  displayName: string;
  photoUrl: string;
}

interface PostCountAchievement {
  type: "postCount";
  count: 1;
  title: "Getting Started!";
  description: "Make your first post.";
}

export type Achievement = PostCountAchievement;

export interface UserStats {
  postCount: number;
  achievements: Achievement[];
}

export interface UserWithStats extends User {
  stats: UserStats;
}
