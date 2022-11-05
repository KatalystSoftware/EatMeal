import { User } from "firebase/auth";

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
  createdAt: Date;
}
