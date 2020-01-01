export enum ETopic {
  COURSE = 'course',
  GONG = 'gong',
}

export interface ITopicData {
  id: string;
  name: string;
  inUse?: boolean;
  reason?: string;
}
