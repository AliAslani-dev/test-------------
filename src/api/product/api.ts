import { ProductsFilters } from './dto';
import { axiosPrivate } from '@/api/axios';

const getProductsByFrameAPI = (bucket_id: number, frame_id: number, params: ProductsFilters) => {
  const route = `/api/products/${bucket_id}/${frame_id}`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const addProductAPI = (bucket_id: number, frame_id: number, fd: FormData) => {
  const response = axiosPrivate.post(`/api/product/${bucket_id}/${frame_id}`, fd, {
    headers: { 'Content-Type': undefined },
  });
  return response;
};

const editProductAPI = (bucket_id: number, product_id: number, fd: FormData) => {
  const response = axiosPrivate.put(`/api/product/${bucket_id}/${product_id}`, fd, {
    headers: { 'Content-Type': undefined },
  });
  return response;
};

const addProductVariantAPI = (
  bucket_id: number,
  frame_id: number,
  product_id: number,
  stock: number,
  weight: number,
  extra_price: number,
  extra_wage: number,
) => {
  const response = axiosPrivate.post(
    `/api/product_variant/${bucket_id}/${frame_id}/${product_id}`,
    {
      stock,
      weight,
      extra_price,
      extra_wage,
    },
  );
  return response;
};

const editProductVariantAPI = (
  bucket_id: number,
  variant_id: number,
  stock?: number,
  extra_price?: number,
  extra_wage?: number,
) => {
  let data: any = {};
  if (stock) data.stock = stock;
  if (extra_price) data.extra_price = extra_price;
  if (extra_wage) data.extra_wage = extra_wage;
  const response = axiosPrivate.put(`/api/product_variant/${bucket_id}/${variant_id}`, {
    stock,
    extra_price,
    extra_wage,
  });
  return response;
};

export {
  getProductsByFrameAPI,
  addProductAPI,
  editProductAPI,
  addProductVariantAPI,
  editProductVariantAPI,
};
