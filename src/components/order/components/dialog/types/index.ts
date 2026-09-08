import { WholesaleOrderTable } from '../../table';

export interface WholesaleOrderDialogProps {
  open: boolean;
  onClose: () => void;
  showingWholesaleOrder: WholesaleOrderTable | undefined;
  setShowingWholesaleOrder: React.Dispatch<React.SetStateAction<WholesaleOrderTable | undefined>>;
  onRefreshList?: () => void;
}

export interface EditableItem {
  uid: string;
  isNew: boolean;
  frame: any | null;
  product: any | null;
  variant: any | null;
  galleryWeight: number | string;
  galleryQuantity: number | string;
  finalWeight: number | string;
  finalQuantity: number | string;
  galleryDescription: string;
  wholesalerDescription: string;
  availableProducts: any[];
}

export interface ExportExcelParams {
  order: any; // استفاده از any برای جلوگیری از ارور تایپ
  items: EditableItem[];
  totalInitialWeight: number;
  totalFinalWeight: number;
  nonZeroGalleryItemsCount: number;
  nonZeroFinalItemsCount: number;
  finalGoldCredit?: number | null;
  finalRialCredit?: number | null;
  displaySettlementName: string;
  displaySendName: string;
  t: (key: string) => string;
}

export interface OrderTableFooterProps {
  totalInitialWeight: number;
  totalFinalWeight: number;
  nonZeroGalleryItemsCount: number;
  nonZeroFinalItemsCount: number;
  finalGoldCredit?: number | null;
  finalRialCredit?: number | null;
  status: number;
  t: (key: string) => string;
}

export interface OrderTableRowProps {
  item: EditableItem;
  index: number;
  catalogFrames: any[];
  canEdit: boolean;
  status: number;
  onUpdateItem: (uid: string, field: keyof EditableItem, value: any) => void;
  onRemoveItem: (uid: string, isNew: boolean) => void;
  onFrameSelect: (uid: string, frame: any) => void;
  t: (key: string) => string;
}

export interface EditableCellProps {
  value: any;
  type: 'weight' | 'quantity' | 'text';
  canEdit: boolean;
  status: number;
  placeholder?: string;
  onChange: (value: any) => void;
  unit?: string;
  isVariant?: boolean;
}

export interface OrderHeaderProps {
  orderTitle?: string | null;
  onClose: () => void;
  disabled: boolean;
}

export interface OrderInfoBarProps {
  zarplusUser: string;
  orderTitle?: string | null;
  status: number;
  onExport: () => void;
  onSort: () => void;
  isExporting: boolean;
  hasItems: boolean;
  t: (key: string) => string;
}

export interface ActionButtonsProps {
  status: number;
  loadingAction: boolean;
  isMobile: boolean;
  hasItems: boolean;
  onReject: () => void;
  onInProgress: () => void;
  onApprove: () => void;
  onDeliver: () => void;
  t: (key: string) => string;
  deliverDisabled?: boolean;
}

export interface OrderTableProps {
  items: EditableItem[];
  catalogFrames: any[];
  canEdit: boolean;
  status: number;
  totalInitialWeight: number;
  totalFinalWeight: number;
  nonZeroGalleryItemsCount: number;
  nonZeroFinalItemsCount: number;
  finalGoldCredit?: number | null;
  finalRialCredit?: number | null;
  onUpdateItem: (uid: string, field: keyof EditableItem, value: any) => void;
  onRemoveItem: (uid: string, isNew: boolean) => void;
  onAddNewRow: () => void;
  onFrameSelect: (uid: string, frame: any) => void;
  t: (key: string) => string;
  isMobile: boolean;
}

export interface DescriptionFieldProps {
  galleryDescription: string;
  wholesalerDescription: string;
  canEdit: boolean;
  onWholesalerChange: (value: string) => void;
  t: (key: string) => string;
}
