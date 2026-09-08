import { orderApi } from '@/api';
import {
  getGalleryAccountingDTO,
  getOrdersDTO,
  getPurchaseSettlementTypesDTO,
  getSendTypesDTO,
  OrdersFilters,
  getAccountingDTO,
  AccountingDTO,
} from './dto';

export type OrderItemsType = (
  | { frame_id: number; weight: number; description: string }
  | { product_id: number; weight: number; description: string }
  | { variant_id: number; quantity: number; description: string }
)[];

export const getGalleryAccounting = async (zarhubUserId: number, zarplusUserId: number) => {
  try {
    const response = await orderApi.getGalleryAccountingAPI(zarhubUserId, zarplusUserId);
    if (response && response.status === 200) {
      return getGalleryAccountingDTO(response.data);
    }
  } catch (err) {
    console.error('Getting gallery accounting failed.', err);
    return getGalleryAccountingDTO([]);
  }
};

export const getAccounting = async (zarhubUserId: number) => {
  try {
    const response = await orderApi.getAccountingAPI(zarhubUserId);
    if (response && response.status === 200) {
      return getAccountingDTO(response.data);
    }
    return null;
  } catch (err) {
    console.error('Getting accounting failed.', err);
    return getAccountingDTO([]);
  }
};
export const getOrders = async (zarhubUserId: number, filters: OrdersFilters) => {
  try {
    const response = await orderApi.getOrdersAPI(zarhubUserId, filters);
    if (response && response.status === 200) {
      return getOrdersDTO(response.data);
    }
  } catch (err) {
    console.error('Getting orders failed.', err);
    return getOrdersDTO([]);
  }
};

export const getAccountingOrders = async (zarhubUserId: number) => {
  try {
    const response = await orderApi.getAccountingOrdersAPI(zarhubUserId);
    if (response && response.status === 200) {
      return getOrdersDTO(response.data);
    }
  } catch (err) {
    console.error('Getting orders failed.', err);
    return getOrdersDTO([]);
  }
};

export const rejectOrder = async (orderId: number) => {
  try {
    const response = await orderApi.rejectOrderAPI(orderId);
    return response.data;
  } catch (err) {
    console.error('Change order status to rejected by wholeasler failed.', err);
    throw err;
  }
};

export const inProgressOrder = async (orderId: number) => {
  try {
    const response = await orderApi.inProgressOrderAPI(orderId);
    return response.data;
  } catch (err) {
    console.error('Change order status to in progress failed.', err);
    throw err;
  }
};

export const approveOrder = async (orderId: number, items: OrderItemsType) => {
  try {
    const response = await orderApi.approveOrderAPI(orderId, items);
    return response.data;
  } catch (err) {
    console.error('Change order status to approved by wholesaler failed.', err);
    throw err;
  }
};

export const deliverOrder = async (
  orderId: number,
  zarhubSendTypeAdditionalFields?: Record<string, string>,
) => {
  try {
    const response = await orderApi.deliverOrderAPI(orderId, zarhubSendTypeAdditionalFields);
    return response.data;
  } catch (err) {
    console.error('Change order status to sent by wholesaler failed.', err);
    throw err;
  }
};

export const getPurchaseSettlementTypes = async () => {
  try {
    const response = await orderApi.getPurchaseSettlementTypesAPI();
    if (response && response.status === 200) {
      return getPurchaseSettlementTypesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting purchase settlement types failed.', err);
    return getPurchaseSettlementTypesDTO([]);
  }
};

export const getSendTypes = async () => {
  try {
    const response = await orderApi.getSendTypesAPI();
    if (response && response.status === 200) {
      return getSendTypesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting send types failed.', err);
    return getSendTypesDTO([]);
  }
};
