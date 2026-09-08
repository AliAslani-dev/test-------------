import JDate from 'jalali-date';

const toNumArray = (v: unknown): number[] => {
  if (Array.isArray(v)) return v.map(Number).filter((n) => !Number.isNaN(n));
  if (typeof v === 'string' && v.trim() !== '') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => !Number.isNaN(n));
    } catch {
      return v
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n));
    }
  }
  return [];
};

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v.trim() !== '') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const tPD = (str: string | number): string => {
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
};

const fWC = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const GENDER_IDS = new Set([48, 51, 54]);

function splitCategories(raw: any): { category: number | null; genderCategory: number | null } {
  const arr = toNumArray(raw);
  if (!Array.isArray(arr) || arr.length === 0) {
    return { category: null, genderCategory: null };
  }

  const genderCategory = arr.find((id) => GENDER_IDS.has(id)) ?? null;
  const category = arr.find((id) => !GENDER_IDS.has(id)) ?? null;

  return { category: category ?? null, genderCategory: genderCategory ?? null };
}

const persianToEnglishNumber = (input: string): string => {
  return input.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
};

function roundTo5(num: number): number {
  return Math.round((num + Number.EPSILON) * 100000) / 100000;
}

export const validateAndConvertJalali = (jalaliDate: string): string | undefined => {
  // 1. Regex Validation: Matches YYYY/MM/DD or YYYY-MM-DD
  const regex = /^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})$/;
  const match = jalaliDate.match(regex);

  if (!match) return undefined;

  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);

  // 2. Logical Validation
  if (m < 1 || m > 12) return undefined;
  if (d < 1 || d > 31) return undefined;
  if (m > 6 && d > 30) return undefined; // Second half of year has 30 days
  // Leap year check is complex in Jalali, but JDate handles the conversion safely usually.

  try {
    // 3. Conversion using the library
    const gDate = JDate.to_gregorian(y, m, d);

    // 4. Format to YYYY-MM-DD string for API
    // We manually format to avoid Timezone shifts that can happen with toISOString()
    const gy = gDate.getFullYear();
    const gm = String(gDate.getMonth() + 1).padStart(2, '0');
    const gd = String(gDate.getDate()).padStart(2, '0');

    return `${gy}-${gm}-${gd}`;
  } catch (e) {
    return undefined;
  }
};

const toIranDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  const iranTimeStr = date.toLocaleString('en-US', { timeZone: 'Asia/Tehran' });
  return new Date(iranTimeStr);
};

function getRandomInt(min: number = 0, max: number = 50000): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
interface BlurOptions {
  blurRadiusInOriginalPx?: number;
  maxDimension?: number;
  quality?: number;
  outputFormat?: OutputFormat;
}
const createBlurredImageFile = (
  originalFile: File,
  options: BlurOptions = {},
): Promise<File | null> => {
  const {
    blurRadiusInOriginalPx = 40,
    maxDimension = 400,
    quality = 0.7,
    outputFormat = 'auto',
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(originalFile);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const scaleFactor = width / img.width;
      const scaledBlur = blurRadiusInOriginalPx * scaleFactor;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      ctx.filter = `blur(${scaledBlur}px)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      const fileExtension = originalFile.name.split('.').pop()?.toLowerCase() || '';
      const mimeType = originalFile.type.toLowerCase();

      let finalFormat: OutputFormat;
      let extension: string;

      if (outputFormat !== 'auto') {
        finalFormat = outputFormat;
      } else {
        if (
          mimeType === 'image/png' ||
          mimeType === 'image/webp' ||
          fileExtension === 'png' ||
          fileExtension === 'webp'
        ) {
          finalFormat = 'image/webp';
        } else {
          finalFormat = 'image/jpeg';
        }
      }

      switch (finalFormat) {
        case 'image/jpeg':
          extension = 'jpg';
          break;
        case 'image/png':
          extension = 'png';
          break;
        case 'image/webp':
          extension = 'webp';
          break;
        default:
          extension = 'jpg';
          finalFormat = 'image/jpeg';
      }

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            resolve(null);
            return;
          }
          const blurredFileName = `blurred_${originalFile.name.replace(/\.[^/.]+$/, '')}.${extension}`;
          const blurredFile = new File([blob], blurredFileName, {
            type: finalFormat,
            lastModified: Date.now(),
          });
          resolve(blurredFile);
        },
        finalFormat,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
};

function formatJalaliDate(dateStr: string): string {
  let normalized = dateStr.trim().replace(/\//g, '-');

  const parts = normalized.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected YYYY-M-D or YYYY/M/D');
  }

  const [year, month, day] = parts;
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');

  return `${year}-${paddedMonth}-${paddedDay}`;
}

const jalaliToGregorian = (dateString: string) => {
  let normalized = dateString.trim().replace(/\//g, '-');

  const parts = normalized.split('-').map(Number);
  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;
  const jalaliDate = new JDate(year, month, day);

  return jalaliDate.toGregorian();
}

export {
  toNumArray,
  toStringArray,
  tPD,
  fWC,
  GENDER_IDS,
  splitCategories,
  persianToEnglishNumber,
  roundTo5,
  toIranDate,
  getRandomInt,
  createBlurredImageFile,
  formatJalaliDate,
  jalaliToGregorian
};
