import { categoryApi } from '@/api';
import { CategoryField, getCategoriesDTO } from './dto';

export const getCategories = async () => {
  try {
    const response = await categoryApi.getCategoriesAPI();
    if (response && response.status === 200) {
      return getCategoriesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting categories failed.', err);
    return getCategoriesDTO([]);
  }
};

export const addCategory = async (enName: string, faName: string, fields: CategoryField[]) => {
  try {
    const response = await categoryApi.addCategoryAPI(enName, faName, fields);
    return response.data;
  } catch (err) {
    console.error('Adding category failed.', err);
    throw err;
  }
};

export const editCategory = async (
  category_id: number,
  enName: string | null,
  faName: string | null,
  fields: CategoryField[] | null,
) => {
  try {
    const response = await categoryApi.editCategoryAPI(category_id, enName, faName, fields);
    return response.data;
  } catch (err) {
    console.error('Editing category failed.', err);
    throw err;
  }
};
