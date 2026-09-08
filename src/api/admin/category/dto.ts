export type CategoryField = {
  name: string;
  options?: string[];
};

export interface CategoryDTO {
  id: number;
  faName: string;
  enName: string;
  fields: null | CategoryField[];
}

export const getCategoriesDTO = (response: any): CategoryDTO[] => {
  return response.map((category: any) => ({
    id: category.id,
    faName: category.fa_name,
    enName: category.en_name,
    fields: category.fields ?? null,
  }));
};
