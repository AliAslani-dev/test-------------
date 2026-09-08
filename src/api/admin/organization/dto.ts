export interface OrganizationDTO {
  id: number;
  faName: string;
  enName: string;
  commission: number;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getOrganizationsDTO = (response: any): OrganizationDTO[] => {
  return response.map((org: any) => ({
    id: org.id,
    faName: org.fa_name,
    enName: org.en_name,
    commission: org.commission,
    isEnabled: org.is_enabled ?? true,
    createdAt: org.created_at,
    updatedAt: org.updated_at,
  }));
};

export const getOrganizationDTO = (response: any): OrganizationDTO => {
  return {
    id: response.id,
    faName: response.fa_name,
    enName: response.en_name,
    commission: response.commission,
    isEnabled: response.is_enabled ?? true,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
};