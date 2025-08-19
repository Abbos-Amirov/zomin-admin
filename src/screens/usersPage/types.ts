export type UserStatus = 'active' | 'block' | 'delete';

export type RUser = {
  _id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};
