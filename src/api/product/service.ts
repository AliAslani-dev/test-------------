import { productApi } from '@/api';
import { getProductsByFrameDTO, ProductsFilters ,  getProductCaratsDTO } from './dto';

import {
  _product_carats,
  _product_categories,
  _product_gender_categories,
} from './hard-code-response';
export const getProductCarats = async () => {
  return getProductCaratsDTO(_product_carats);
  // try {
  //   const response = await productAPI.getProductCaratsAPI();
  //   if (response && response.status === 200) {
  //     return getProductCaratsDTO(response.data);
  //   }
  // } catch (err) {
  //   console.error('Getting product carats failed.', err);
  //   return [];
  // }
};

export const getProductsByFrame = async (
  bucket_id: number,
  frame_id: number,
  params: ProductsFilters,
) => {
  try {
    const response = await productApi.getProductsByFrameAPI(bucket_id, frame_id, params);
    if (response && response.status === 200) {
      return getProductsByFrameDTO(response.data);
    }
  } catch (err) {
    console.error('Getting products failed.', err);
    return {
      bucketName: '',
      products: [],
      frame: null,
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 25,
        total: 0,
      },
    };
  }
};

export const addProduct = async (
  bucketId: number,
  frameId: number,
  model: string,
  image: File,
  image2?: File,
  image3?: File,
  image4?: File,
  image5?: File,
) => {
  const fd = new FormData();
  fd.append('model', model);
  fd.append('image', image, image.name);
  if (image2) fd.append('image2', image2, image2.name);
  if (image3) fd.append('image3', image3, image3.name);
  if (image4) fd.append('image4', image4, image4.name);
  if (image5) fd.append('image5', image5, image5.name);

  return productApi
    .addProductAPI(bucketId, frameId, fd)
    .then((response) => response.data ?? response);
};

export const editProduct = async (
  bucketId: number,
  productId: number,
  model?: string,
  image?: File,
  image2?: File,
  image3?: File,
  image4?: File,
  image5?: File,
) => {
  const fd = new FormData();
  if (model !== undefined) fd.append('model', model);
  if (image !== undefined) fd.append('image', image, image.name);
  if (image2) fd.append('image2', image2, image2.name);
  if (image3) fd.append('image3', image3, image3.name);
  if (image4) fd.append('image4', image4, image4.name);
  if (image5) fd.append('image5', image5, image5.name);

  return productApi
    .editProductAPI(bucketId, productId, fd)
    .then((response) => response.data ?? response);
};

export const addProductVariant = async (
  bucketId: number,
  frameId: number,
  productId: number,
  stock: number,
  weight: number,
  extraPrice: number,
  extraWage: number,
) => {
  try {
    const response = await productApi.addProductVariantAPI(
      bucketId,
      frameId,
      productId,
      stock,
      weight,
      extraPrice,
      extraWage,
    );
    return response.data;
  } catch (err) {
    console.error('Adding product variant failed.', err);
    throw err;
  }
};

export const editProductVariant = async (
  bucketId: number,
  variantId: number,
  stock: number,
  extraPrice: number,
  extraWage: number,
) => {
  try {
    const response = await productApi.editProductVariantAPI(
      bucketId,
      variantId,
      stock,
      extraPrice,
      extraWage,
    );
    return response.data;
  } catch (err) {
    console.error('Editing product variant failed.', err);
    throw err;
  }
};
