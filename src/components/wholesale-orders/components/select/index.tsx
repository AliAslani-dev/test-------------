'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import { PurchaseSettlementTypeDTO, SendTypeDTO } from '@/api/zarhub/dto';
import { getPurchaseSettlementTypes, getSendTypes } from '@/api/zarhub/service';
import SearchableSelect from '@/components/shared/searchable-select';

interface PurchaseSettlementTypeSelectProps {
  title: string;
  value: PurchaseSettlementTypeDTO | null;
  setValue: React.Dispatch<React.SetStateAction<PurchaseSettlementTypeDTO | null>>;
}

interface SendTypeSelectProps {
  title: string;
  value: SendTypeDTO | null;
  setValue: React.Dispatch<React.SetStateAction<SendTypeDTO | null>>;
}

const PurchaseSettlementTypeSelect: FunctionComponent<PurchaseSettlementTypeSelectProps> = ({
  title,
  value,
  setValue,
}) => {
  const { t } = useText('wholesaleOrder');

  return (
    <SearchableSelect<PurchaseSettlementTypeDTO>
      id={'PurchaseSettlementTypeSelector'}
      title={title}
      hasStar
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getPurchaseSettlementTypes()) ?? [];
      }}
      optionLabel={(o) => o.name}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('select.placeholder')}
      validate={(v) => v !== null}
    />
  );
};

const SendTypeSelect: FunctionComponent<SendTypeSelectProps> = ({ value, setValue }) => {
  const { t } = useText('wholesaleOrder');

  return (
    <SearchableSelect<SendTypeDTO>
      id={'SendTypeSelector'}
      title={t('send_type_select.title')}
      hasStar
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getSendTypes()) ?? [];
      }}
      optionLabel={(o) => o.name}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('select.placeholder')}
      validate={(v) => v !== null}
    />
  );
};

export { PurchaseSettlementTypeSelect, SendTypeSelect };
