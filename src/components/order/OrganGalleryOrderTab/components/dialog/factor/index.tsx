'use client';

import Image from 'next/image';
import JDate from 'jalali-date';
import { fWC, tPD } from '@/utils';
import { OrderTable } from '../../table';
import { FunctionComponent } from 'react';
import { AllOrderTable } from '@/components/all-orders/components/table';

interface FactorProps {
  data: OrderTable | AllOrderTable | undefined;
}

const FactorPreview: FunctionComponent<FactorProps> = ({ data }) => {
  if (!data) return null;

  const jalaliDate = JDate.toJalali(data.createdAt);
  const dateStr = tPD(`${jalaliDate[0]}/${jalaliDate[1]}/${jalaliDate[2]}`);

  const price = Number(data.price) || 0;
  const basePrice = Math.floor(price * 1);
  const finalPrice = Math.floor(price * 1.03);
  const tax = Math.floor(price * 0.03);
  const item = data.invoiceItems?.[0] || ({} as any);

  const isZarplus = data.firstName === 'زرپلاس';
  const buyerName = isZarplus ? '' : `${data.firstName ?? ''} ${data.lastName ?? ''}`;
  const buyerAddress =
    isZarplus || !data.shippingAddress
      ? ''
      : `${data.shippingAddress} - کد پستی: ${tPD(data.postalCode)}`;

  return (
    <div
      id="a5-print-wrapper"
      style={{
        position: 'relative',
        zIndex: 0,
        width: '100%',
        height: '100%',
        minHeight: '210mm',
        padding: '15px 58px 20px 58px',
        boxSizing: 'border-box',
        fontFamily: 'Parastoo, sans-serif',
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        color: '#000',
        margin: 0,
      }}
    >
      <Image
        src="/images/Invoice_Layout.jpg"
        alt="Background"
        fill
        priority
        unoptimized
        style={{
          objectFit: 'cover',
          mixBlendMode: 'multiply',
          zIndex: -1,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        {data.logo ? (
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <Image
              src={data.logo}
              alt="Logo"
              fill
              priority
              unoptimized
              style={{
                objectFit: 'contain',
                borderRadius: 8,
                mixBlendMode: 'multiply',
              }}
            />
          </div>
        ) : (
          <div style={{ width: '130px', height: '130px' }} />
        )}
        <h1 style={{ fontWeight: 900, fontSize: '26px', margin: '22px 0 0 0' }}>
          {data.defaultBucketName}
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: '15px',
          fontWeight: 200,
          marginBottom: '16px',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 900, marginLeft: '5px' }}>شعبه :</span>
            {data.paymentTypeTitleFa} - {data.site}
          </div>
          <div>
            <span style={{ fontWeight: 900, marginLeft: '5px' }}>تاریخ :</span>
            {dateStr}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 900, marginLeft: '5px' }}>نام خریدار :</span>
            {buyerName}
          </div>
          <div>
            <span style={{ fontWeight: 900, marginLeft: '5px' }}>شماره فاکتور :</span>
            {tPD(String(data.id))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 900, marginLeft: '5px' }}>شماره تماس خریدار :</span>
            <span style={{ direction: 'ltr', display: 'inline-block' }}>
              {data.mobilePhone ? tPD(data.mobilePhone) : ''}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 900, marginLeft: '5px' }}>قیمت هر گرم طلا ۱۸ عیار :</span>
            {tPD(fWC(item.goldPrice))}
          </div>
        </div>

        <div style={{ width: '100%' }}>
          <span style={{ fontWeight: 900, marginLeft: '5px' }}>آدرس خریدار :</span>
          {buyerAddress}
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '15px',
            textAlign: 'center',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#ded3c6', overflow: 'hidden' }}>
              <th
                style={{
                  padding: '8px',
                  fontWeight: 900,
                  width: '10%',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                ردیف
              </th>
              <th style={{ padding: '8px', fontWeight: 900, width: '40%', textAlign: 'right' }}>
                شرح کالا
              </th>
              <th style={{ padding: '8px', fontWeight: 900, width: '15%' }}>عیار</th>
              <th style={{ padding: '8px', fontWeight: 900, width: '15%' }}>وزن</th>
              <th
                style={{
                  padding: '8px',
                  fontWeight: 900,
                  width: '20%',
                  textAlign: 'left',
                  borderRadius: '8px 0 0 8px',
                }}
              >
                مبلغ ریالی
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px 8px 8px 8px', fontWeight: 200 }}>۱</td>
              <td style={{ padding: '10px 8px 8px 8px', fontWeight: 200, textAlign: 'right' }}>
                {item.title}
              </td>
              <td style={{ padding: '10px 8px 8px 8px', fontWeight: 200 }}>
                {tPD(String(item.carat))}
              </td>
              <td style={{ padding: '10px 8px 8px 8px', fontWeight: 200 }}>
                {tPD(String(item.weight))} گرم
              </td>
              <td style={{ padding: '10px 8px 8px 8px', fontWeight: 200, textAlign: 'left' }}>
                {tPD(
                  fWC(
                    data.fromMiniApps === 2 || data.fromMiniApps === 3 || data.fromMiniApps === 4
                      ? finalPrice
                      : basePrice,
                  ),
                )}
              </td>
            </tr>
            {data.image && (
              <tr>
                <td></td>
                <td colSpan={4} style={{ textAlign: 'right', padding: '3px 8px 3px 8px' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '70px',
                      height: '70px',
                      display: 'inline-block',
                    }}
                  >
                    <Image
                      src={data.image}
                      alt="Product image"
                      fill
                      priority
                      unoptimized
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: '16px',
          gap: '10px',
        }}
      >
        <div style={{ height: '1px', backgroundColor: '#e0e0e0', width: '100%' }} />

        {data.fromMiniApps !== 2 && data.fromMiniApps !== 3 && data.fromMiniApps !== 4 && (
          <>
            {' '}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 15px 0 8px',
              }}
            >
              <span style={{ fontWeight: 900 }}>مالیات :</span>
              <span style={{ fontWeight: 200 }}>{tPD(fWC(tax))}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#e0e0e0', width: '100%' }} />
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 15px 0 8px' }}>
          <span style={{ fontWeight: 900 }}>مبلغ کل :</span>
          <span style={{ fontWeight: 900, fontSize: '18px' }}>{tPD(fWC(finalPrice))}</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: '0 30px 55px 15px',
          fontSize: '14px',
          fontWeight: 200,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: '20px', fontSize: '18px' }}>
          {data.defaultBucketName}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span
              style={{
                minWidth: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#7b562a',
                marginLeft: '8px',
                marginTop: '6px',
              }}
            ></span>
            <div style={{ flex: 1, lineHeight: '1.5' }}>
              <span style={{ fontWeight: 200, marginLeft: '5px' }}>شماره تماس :</span>
              <span style={{ fontWeight: 900, direction: 'ltr', display: 'inline-block' }}>
                {tPD(data.sellerMobile)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', direction: 'rtl' }}>
            <span
              style={{
                minWidth: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#7b562a',
                marginLeft: '8px',
                marginTop: '6px',
              }}
            ></span>
            <div style={{ flex: 1, lineHeight: '1.5' }}>
              <span style={{ fontWeight: 200, marginLeft: '5px' }}>وب‌سایت گالری :</span>{' '}
              <span style={{ fontWeight: 900, direction: 'ltr', display: 'inline-block' }}>
                {data.domainPrefix}.zar.plus
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span
              style={{
                minWidth: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#7b562a',
                marginLeft: '8px',
                marginTop: '6px',
              }}
            ></span>
            <div style={{ flex: 1, lineHeight: '1.6' }}>
              <span style={{ fontWeight: 200, marginLeft: '5px' }}>آدرس :</span> {data.province}،{' '}
              {data.city}، {data.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactorPreview;
