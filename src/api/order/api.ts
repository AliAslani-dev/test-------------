import { axiosPrivate } from '@/api/axios';
import { OrderItemsType } from './service';
import { OrdersFilters } from './dto';

const getGalleryAccountingAPI = (zarhub_user_id: number, zarplus_user_id: number) => {
  const route = `/api/accounting/${zarhub_user_id}/${zarplus_user_id}`;
  const response = axiosPrivate.get(route);
  return response;
};

const getAccountingAPI = (zarhub_user_id: number) => {
  const route = `/api/accounting/${zarhub_user_id}`;
  const response = axiosPrivate.get(route);
  return response;
};

const getOrdersAPI = (zarhub_user_id: number, params: OrdersFilters) => {
  const route = `/api/orders/${zarhub_user_id}`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const getAccountingOrdersAPI = (zarhub_user_id: number) => {
  const route = `/api/orders/${zarhub_user_id}`;
  const response = axiosPrivate.get(route);
  return response;
};

const rejectOrderAPI = (order_id: number) => {
  const response = axiosPrivate.put(`/api/reject_order/${order_id}`);
  return response;
};

const inProgressOrderAPI = (order_id: number) => {
  const response = axiosPrivate.put(`/api/in_progress_order/${order_id}`);
  return response;
};

const approveOrderAPI = (order_id: number, final_items: OrderItemsType) => {
  const response = axiosPrivate.put(`/api/approve_order/${order_id}`, {
    final_items,
  });
  return response;
};

const deliverOrderAPI = (
  order_id: number,
  zarhub_send_type_additional_fields?: Record<string, string>,
) => {
  const response = axiosPrivate.put(`/api/deliver_order/${order_id}`, {
    zarhub_send_type_additional_fields,
  });
  return response;
};

const getPurchaseSettlementTypesAPI = () => {
  const route = `/api/settlement_types`;
  const response = axiosPrivate.get(route);
  return response;
};

const getSendTypesAPI = () => {
  const route = `/api/send_types`;
  const response = axiosPrivate.get(route);
  return response;
};

export {
  getGalleryAccountingAPI,
  getAccountingAPI,
  getOrdersAPI,
  rejectOrderAPI,
  getAccountingOrdersAPI,
  inProgressOrderAPI,
  approveOrderAPI,
  deliverOrderAPI,
  getPurchaseSettlementTypesAPI,
  getSendTypesAPI,
};
