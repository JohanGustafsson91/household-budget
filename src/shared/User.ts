export interface User {
  name: string;
  id: string;
  gender: Gender;
  friends: Friend[];
}

export interface Friend {
  id: string;
  name: string;
  gender: Gender;
}

export type Gender = "male" | "female";
