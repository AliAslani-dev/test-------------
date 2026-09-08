import { toIranDate } from '@/utils';

export interface BucketDTO {
  id: number;
  userId: number;
  identifier: string;
  name: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const getBucketDTO = (response: any): BucketDTO[] => {
  return response.map((bucket: any) => ({
    id: bucket.id,
    userId: bucket.user_id,
    identifier: bucket.identifier,
    name: bucket.name,
    enabled: bucket.enabled == 1,
    createdAt: toIranDate(bucket.created_at),
    updatedAt: toIranDate(bucket.updated_at),
  }));
};
