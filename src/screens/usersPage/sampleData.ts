import { RUser } from './types';

const now = Date.now();
export const USERS_SEED: RUser[] = [
  { _id:'u1', name:'Alice Kim',  phone:'+82 10-1111-1111', avatarUrl:'https://i.pravatar.cc/120?img=1', status:'active',
    createdAt:new Date(now-86400000).toISOString(), updatedAt:new Date(now-3600000).toISOString() },
  { _id:'u2', name:'Burak Yılmaz', phone:'+90 532 000 0002', avatarUrl:'https://i.pravatar.cc/120?img=5', status:'block',
    createdAt:new Date(now-7200000).toISOString(), updatedAt:new Date(now-1800000).toISOString() },
  { _id:'u3', name:'Jane Doe',   phone:'+82 10-3333-3333', avatarUrl:'https://i.pravatar.cc/120?img=7', status:'delete',
    createdAt:new Date(now-5400000).toISOString(), updatedAt:new Date(now-5400000).toISOString() },
];
