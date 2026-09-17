export type WholesalerMode = 'moreSales' | 'approved';

export type PageMode = 'tags' | WholesalerMode;

export type ModifiedWholesalerDTO = {
  id: number;
  approved: boolean;
  bucketName: string;
  address: string;
  logo: string;
  province: string;
  city: string;
  showcase: string;
  domain: string;
};
