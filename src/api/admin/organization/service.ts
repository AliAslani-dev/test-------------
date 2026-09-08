import {
  getOrganizationsAPI,
  addOrganizationAPI,
  editOrganizationAPI,
  toggleOrganizationAPI,
} from '@/api/admin/organization/api';
import {
  getOrganizationsDTO,
  getOrganizationDTO,
  OrganizationDTO,
} from '@/api/admin/organization/dto';

export const getOrganizations = async (): Promise<OrganizationDTO[]> => {
  try {
    const response = await getOrganizationsAPI();
    if (response && response.status === 200) {
      return getOrganizationsDTO(response.data);
    }
    return [];
  } catch (err) {
    console.error('Getting organizations failed.', err);
    return [];
  }
};

export const addOrganization = async (
  enName: string,
  faName: string,
  commission: number,
): Promise<OrganizationDTO> => {
  try {
    const response = await addOrganizationAPI(enName, faName, commission);
    return getOrganizationDTO(response.data);
  } catch (err) {
    console.error('Adding organization failed.', err);
    throw err;
  }
};

export const editOrganization = async (
  orgId: number,
  commission: number,
): Promise<OrganizationDTO> => {
  try {
    const response = await editOrganizationAPI(orgId, commission);
    return getOrganizationDTO(response.data);
  } catch (err) {
    console.error('Editing organization failed.', err);
    throw err;
  }
};

export const toggleOrganization = async (orgId: number): Promise<void> => {
  try {
    await toggleOrganizationAPI(orgId);
  } catch (err) {
    console.error('Toggling organization failed.', err);
    throw err;
  }
};
