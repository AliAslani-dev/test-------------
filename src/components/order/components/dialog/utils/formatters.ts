export const convertToEnglishNumber = (value: string): string => {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = value;

  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persian[i], 'g'), String(i));
    result = result.replace(new RegExp(arabic[i], 'g'), String(i));
  }

  result = result.replace(/[^0-9.]/g, '');

  const parts = result.split('.');
  if (parts.length > 2) {
    result = parts[0] + '.' + parts.slice(1).join('');
  }

  return result;
};

export const formatPersianDate = (dateValue: any): string => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateUid = (): string => Math.random().toString(36).substring(7);

export const getItemKey = (item: any): string => {
  if (item.variant?.id) return `v_${item.variant.id}`;
  if (item.product?.id) return `p_${item.product.id}`;
  if (item.frame?.id) return `f_${item.frame.id}`;
  return `unknown_${Math.random()}`;
};
