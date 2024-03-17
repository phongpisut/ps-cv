export type User = {
    user: string;
    nickname: string;
    color?: string;
    position: number;
  };
  
export type UserInZone = {
    [key: string]: User[] | [];
  };