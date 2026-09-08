import { CategoryField } from './dto';
import { axiosPrivate } from '@/api/axios';

const getCategoriesAPI = () => {
  const route = '/api/admin/categories';
  const response = axiosPrivate.get(route);
  return response;
};

const addCategoryAPI = (enName: string, faName: string, fields: CategoryField[]) => {
  const response = axiosPrivate.post('/api/admin/category', {
    en_name: enName,
    fa_name: faName,
    fields: fields,
  });
  return response;
};

const editCategoryAPI = (
  category_id: number,
  enName: string | null,
  faName: string | null,
  fields: CategoryField[] | null,
) => {
  const params: any = {};
  if (enName) params.en_name = enName;
  if (faName) params.fa_name = faName;
  if (fields) params.fields = fields;

  const response = axiosPrivate.put(`/api/admin/category/edit/${category_id}`, params);
  return response;
};

export { getCategoriesAPI, addCategoryAPI, editCategoryAPI };
