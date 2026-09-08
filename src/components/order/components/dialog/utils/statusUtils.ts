interface StatusDetails {
  label: string;
  colorKey: 'success' | 'error' | 'info' | 'warning' | 'grey';
}

export const getStatusDetails = (statusValue: number): StatusDetails => {
  const statusMap: Record<number, StatusDetails> = {
    6: { label: 'نهایی شده', colorKey: 'success' },
    5: { label: 'دریافت شده', colorKey: 'success' },
    4: { label: 'ارسال شده', colorKey: 'info' },
    3: { label: 'در انتظار ارسال', colorKey: 'success' },
    2: { label: 'تایید شده توسط بنکدار', colorKey: 'success' },
    1: { label: 'در حال بررسی', colorKey: 'info' },
    0: { label: 'ثبت شده', colorKey: 'warning' },
    [-1]: { label: 'رد شده توسط بنکدار', colorKey: 'error' },
    [-2]: { label: 'رد شده توسط گالری', colorKey: 'error' },
  };

  return statusMap[statusValue] || { label: 'نامشخص', colorKey: 'grey' };
};
