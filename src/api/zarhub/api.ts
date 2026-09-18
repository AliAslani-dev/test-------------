import { axiosPrivate } from '@/api/axios';
import { ProductsFilters, WholesaleOrdersFilters } from './dto';
import { OrderItemsType } from './service';

const getZarhubCategoriesAPI = () => {
  const route = `/api/zarplus_admin/categories`;
  const response = axiosPrivate.get(route);
  return response;
};

const getZarhubGenderCategoriesAPI = () => {
  const route = `/api/zarplus_admin/gender_categories`;
  const response = axiosPrivate.get(route);
  return response;
};

const getWholesalersAPI = () => {
  const route = `/api/zarhub_admin/providers`;
  const response = axiosPrivate.get(route);
  return response;
};

const getWholesalerFramesAPI = (zarhub_user_id: number) => {
  const route = `/api/zarhub_admin/provider_frames/${zarhub_user_id}`;
  const response = axiosPrivate.get(route);
  return response;
};

const getWholesalerFrameProductsAPI = (
  zarhub_user_id: number,
  // zarplus_user_id: number,
  frame_id: number,
  params: ProductsFilters,
) => {
  const route = `/api/zarhub_admin/provider_products/${frame_id}/${zarhub_user_id}`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const getViewRequestsAPI = (zarplus_user_id: number) => {
  const route = `/api/zarplus_admin/view_requests/${zarplus_user_id}`;
  const response = axiosPrivate.get(route);
  return response;
};

const addNewViewWholesalerRequestAPI = (zarhub_user_id: number, zarplus_user_id: number) => {
  const response = axiosPrivate.post(`/api/zarplus_admin/new_view_request`, {
    zarhub_user_id,
    zarplus_user_id,
  });
  return response;
};

const addNewOrderAPI = (
  seller_user_id: number,
  buyer_user_id: number,
  bucket_id: number,
  items: OrderItemsType,
  title: string | null,
  from_zarhub: 0 | 1,
) => {
  const params: any = {
    seller_user_id,
    buyer_user_id,
    items,
    from_zarhub,
  };

  if (title !== null) {
    params.title = title;
  }

  const response = axiosPrivate.post(`/api/zarhub_admin/new_order/${bucket_id}`, params);

  return response;
};
const getWholesaleOrdersAPI = (zarplus_user_id: number, params: WholesaleOrdersFilters) => {
  const route = `/api/zarplus_admin/orders/${zarplus_user_id}`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const getBuyerOrderApi = (buyer_user_id: number, params: WholesaleOrdersFilters) => {
  const route = `/api/zarhub_admin/orders/${buyer_user_id}`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const rejectOrderAPI = (order_id: number) => {
  const response = axiosPrivate.put(`/api/zarhub_admin/reject_order/${order_id}`);
  return response;
};

const approveOrderAPI = (
  order_id: number,
  settlement_type_id: number,
  send_type_id: number,
  send_type_additional_fields?: Record<string, string>,
  settlement_type_additional_fields?: Record<string, string>,
) => {
  const response = axiosPrivate.put(`/api/zarplus_admin/approve_order/${order_id}`, {
    settlement_type_id,
    send_type_id,
    send_type_additional_fields,
    settlement_type_additional_fields,
  });
  return response;
};

const receiveOrderAPI = (order_id: number) => {
  const response = axiosPrivate.put(`/api/zarplus_admin/receive_order/${order_id}`);
  return response;
};

const getPurchaseSettlementTypesAPI = () => {
  const route = `/api/zarplus_admin/settlement_types`;
  const response = axiosPrivate.get(route);
  return response;
};

const getSendTypesAPI = () => {
  const route = `/api/zarplus_admin/send_types`;
  const response = axiosPrivate.get(route);
  return response;
};

// Tags APIs
const getAvailableCategoriesAPI = () => {
  const route = `/api/admin/categories`;
  const response = axiosPrivate.get(route);
  return response;
};

const getTagsAPI = (category_id: number) => {
  const route = `/api/zarplus_admin/tags/${category_id}`;
  const response = axiosPrivate.get(route);
  return response;
};

const getLatestTagsAPI = (limit: number) => {
  const route = `/api/zarplus_admin/latest_tags`;
  const response = axiosPrivate.get(route, { params: { limit } });
  return response;
};

const getTagAPI = (tagId: number) => {
  const route = `/api/zarplus_admin/tag/${tagId}`;
  const response = axiosPrivate.get(route);
  return response;
};

export {
  getZarhubCategoriesAPI,
  getZarhubGenderCategoriesAPI,
  getWholesalersAPI,
  getWholesalerFramesAPI,
  getWholesalerFrameProductsAPI,
  getViewRequestsAPI,
  addNewViewWholesalerRequestAPI,
  addNewOrderAPI,
  getWholesaleOrdersAPI,
  rejectOrderAPI,
  approveOrderAPI,
  receiveOrderAPI,
  getPurchaseSettlementTypesAPI,
  getSendTypesAPI,
  getAvailableCategoriesAPI,
  getTagsAPI,
  getTagAPI,
  getLatestTagsAPI,
  getBuyerOrderApi,
};
