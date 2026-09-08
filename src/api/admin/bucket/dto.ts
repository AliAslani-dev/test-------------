import { toIranDate } from '@/utils';

export interface AdminBucketDTO {
  id: number;
  userId: number;
  identifier: string;
  name: string;
  showName: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const getAdminBucketDTO = (response: any): AdminBucketDTO[] => {
  return response.map((bucket: any) => ({
    id: bucket.id,
    userId: bucket.user_id,
    identifier: bucket.identifier,
    name: bucket.name,
    showName: bucket.show_name == 1,
    enabled: bucket.enabled == 1,
    createdAt: toIranDate(bucket.created_at),
    updatedAt: toIranDate(bucket.updated_at),
  }));
};
