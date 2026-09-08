import { axiosPrivate } from '@/api/axios';

// GET all organizations
const getOrganizationsAPI = () => {
  const route = '/api/admin/organizations';
  const response = axiosPrivate.get(route);
  return response;
};

// POST create organization
const addOrganizationAPI = (enName: string, faName: string, commission: number) => {
  const response = axiosPrivate.post('/api/admin/organization', {
    en_name: enName,
    fa_name: faName,
    commission: commission,
  });
  return response;
};

// PUT edit organization
const editOrganizationAPI = (orgId: number, commission: number) => {
  const response = axiosPrivate.put(`/api/admin/organization/edit/${orgId}`, {
    commission: commission,
  });
  return response;
};

// PUT toggle organization status
const toggleOrganizationAPI = (orgId: number) => {
  const response = axiosPrivate.put(`/api/admin/organization/toggle_enable/${orgId}`);
  return response;
};

export { 
  getOrganizationsAPI, 
  addOrganizationAPI, 
  editOrganizationAPI, 
  toggleOrganizationAPI 
};