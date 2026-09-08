export const ORDER_STATUS = {
  DRAFT: 0,
  PENDING: 1,
  APPROVED_BY_WHOLESALER: 2,
  APPROVED_BY_GALLERY: 3,
  DELIVERED_BY_WHOLESALER: 4,
  RECEIVED_BY_GALLERY: 5,
  FINALIZED: 6,
  REJECTED_BY_WHOLESALER: -1,
  REJECTED_BY_GALLERY: -2,
} as const;

export const EDITABLE_STATUSES: number[] = [ORDER_STATUS.PENDING];

export const ACTIONABLE_STATUSES: number[] = [
  ORDER_STATUS.DRAFT,
  ORDER_STATUS.PENDING,
  ORDER_STATUS.APPROVED_BY_GALLERY,
];

export const getStatusColor = (
  status: number,
): 'success' | 'error' | 'info' | 'warning' | 'grey' => {
  if (status === 6 || status === 5 || status === 3 || status === 2) return 'success';
  if (status === 4 || status === 1) return 'info';
  if (status === 0) return 'warning';
  if (status === -1 || status === -2) return 'error';
  return 'grey';
};
