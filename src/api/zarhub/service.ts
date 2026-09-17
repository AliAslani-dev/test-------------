import { zarhubApi } from '@/api';
import {
  FrameDTO,
  getProductsByFrameDTO,
  getViewRequestsDTO,
  getWholesaleOrdersDTO,
  getWholesalerFramesDTO,
  getWholesalersDTO,
  getPurchaseSettlementTypesDTO,
  ProductsFilters,
  WholesaleOrdersFilters,
  getSendTypesDTO,
  getAvailableCategoriesDTO,
  getTagsDTO,
  getTagDTO,
} from './dto';
import {
  getProductCategoriesDTO,
  getProductGenderCategoriesDTO,
  getProductsByBucketDTO,
} from '../product/dto';

export const getZarhubCategories = async () => {
  try {
    const response = await zarhubApi.getZarhubCategoriesAPI();
    if (response && response.status === 200) {
      return getProductCategoriesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting zarhub categories failed.', err);
    return getProductCategoriesDTO([]);
  }
};

export const getZarhubGenderCategories = async () => {
  try {
    const response = await zarhubApi.getZarhubGenderCategoriesAPI();
    if (response && response.status === 200) {
      return getProductGenderCategoriesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting zarhub gender categories failed.', err);
    return getProductGenderCategoriesDTO([]);
  }
};

export const getWholesalers = async () => {
  try {
    const response = await zarhubApi.getWholesalersAPI();
    if (response && response.status === 200) {
      return getWholesalersDTO(response.data);
    }
  } catch (err) {
    console.error('Getting wholesalers list failed.', err);
    return getWholesalersDTO([]);
  }
};

export const getWholesalerFrames = async (zarhubUserId: number, zarplusUserId: number) => {
  try {
    const response = await zarhubApi.getWholesalerFramesAPI(zarhubUserId, zarplusUserId);
    if (response && response.status === 200) {
      return getWholesalerFramesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting wholesaler frames failed.', err);
    return getWholesalerFramesDTO([]);
  }
};

export const getWholesalerFrameProducts = async (
  zarhubUserId: number,
  zarplusUserId: number,
  frameId: number,
  params: ProductsFilters,
) => {
  try {
    const response = await zarhubApi.getWholesalerFrameProductsAPI(
      zarhubUserId,
      zarplusUserId,
      frameId,
      params,
    );
    if (response && response.status === 200) {
      return getProductsByFrameDTO(response.data);
    }
  } catch (err) {
    console.error('Getting frame products failed.', err);
    return {
      bucketName: '',
      frame: {} as FrameDTO,
      products: [],
      meta: {
        currentPage: 0,
        lastPage: 0,
        perPage: 25,
        total: 0,
      },
    };
  }
};

export const getViewRequests = async (zarplusUserId: number) => {
  try {
    const response = await zarhubApi.getViewRequestsAPI(zarplusUserId);
    if (response && response.status === 200) {
      return getViewRequestsDTO(response.data);
    }
  } catch (err) {
    console.error('Getting view requests failed.', err);
    return getViewRequestsDTO([]);
  }
};

export const addNewViewWholesalerRequest = async (zarhubUserId: number, zarplusUserId: number) => {
  try {
    const response = await zarhubApi.addNewViewWholesalerRequestAPI(zarhubUserId, zarplusUserId);
    return response.data;
  } catch (err) {
    console.error('Adding new view request failed.', err);
    throw err;
  }
};

export type OrderItemsType = (
  | { frame_id: number; weight: number; description: string }
  | { product_id: number; weight: number; description: string }
  | { variant_id: number; quantity: number; description: string }
)[];

export const addNewOrder = async (
  zarhubUserId: number,
  zarplusUserId: number,
  bucketId: number,
  items: OrderItemsType,
  title: string | null,
  fromZarhub: 0 | 1,
) => {
  try {
    const response = await zarhubApi.addNewOrderAPI(
      zarhubUserId,
      zarplusUserId,
      bucketId,
      items,
      title,
      fromZarhub,
    );

    return response.data;
  } catch (err) {
    console.error('Adding new order failed.', err);

    throw err;
  }
};

export const getWholesaleOrders = async (
  zarplusUserId: number,
  filters: WholesaleOrdersFilters,
) => {
  try {
    const response = await zarhubApi.getWholesaleOrdersAPI(zarplusUserId, filters);
    if (response && response.status === 200) {
      return getWholesaleOrdersDTO(response.data);
    }
  } catch (err) {
    console.error('Getting wholesale orders failed.', err);
    return getWholesaleOrdersDTO([]);
  }
};

export const rejectOrder = async (orderId: number) => {
  try {
    const response = await zarhubApi.rejectOrderAPI(orderId);
    return response.data;
  } catch (err) {
    console.error('Change order status to rejected by gallery failed.', err);
    throw err;
  }
};

export const approveOrder = async (
  orderId: number,
  settlementTypeId: number,
  sendTypeId: number,
  sendTypeAdditionalFields?: Record<string, string>,
  settlementTypeAdditionalFields?: Record<string, string>,
) => {
  try {
    const response = await zarhubApi.approveOrderAPI(
      orderId,
      settlementTypeId,
      sendTypeId,
      sendTypeAdditionalFields,
      settlementTypeAdditionalFields,
    );
    return response.data;
  } catch (err) {
    console.error('Change order status to approved by gallery failed.', err);
    throw err;
  }
};

export const receiveOrder = async (orderId: number) => {
  try {
    const response = await zarhubApi.receiveOrderAPI(orderId);
    return response.data;
  } catch (err) {
    console.error('Change order status to received by gallery failed.', err);
    throw err;
  }
};

export const getPurchaseSettlementTypes = async () => {
  try {
    const response = await zarhubApi.getPurchaseSettlementTypesAPI();
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
    const response = await zarhubApi.getSendTypesAPI();
    if (response && response.status === 200) {
      return getSendTypesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting send types failed.', err);
    return getSendTypesDTO([]);
  }
};

/* -------------------------------------------------------------------------- */
/*                                    Tags                                    */
/* -------------------------------------------------------------------------- */

export const getAvailableCategories = async () => {
  try {
    const response = await zarhubApi.getAvailableCategoriesAPI();

    if (response && response.status === 200) {
      return getAvailableCategoriesDTO(response.data);
    }

    return getAvailableCategoriesDTO([]);
  } catch (err) {
    console.error('Getting available categories failed.', err);
    return getAvailableCategoriesDTO([]);
  }
};

export const getTags = async (categoryId: number) => {
  try {
    const response = await zarhubApi.getTagsAPI(categoryId);

    if (response && response.status === 200) {
      return getTagsDTO(response.data);
    }

    return getTagsDTO([]);
  } catch (err) {
    console.error('Getting tags failed.', err);
    return getTagsDTO([]);
  }
};

export const getLatestTags = async (limit: number) => {
  try {
    const response = await zarhubApi.getLatestTagsAPI(limit);

    if (response && response.status === 200) {
      return getTagsDTO(response.data);
    }

    return getTagsDTO([]);
  } catch (err) {
    console.error('Getting latest tags failed.', err);
    return getTagsDTO([]);
  }
};

export const getTag = async (tagId: number) => {
  try {
    const response = await zarhubApi.getTagAPI(tagId);
    if (response && response.status === 200) {
      return getTagDTO(response.data);
    }
  } catch (err) {
    console.error('Getting tag failed.', err);
    return {
      id: 0,
      sellerId: 0,
      name: '',
      categoryEnName: '',
      categoryFaName: '',
      categoryId: 0,
      position: 0,
      banners: [],
      enabled: false,
      bundles: [],
    };
  }
};
