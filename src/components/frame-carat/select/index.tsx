'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import { useLang } from '@/hooks/LanContext';
import { FrameCaratDTO } from '@/api/frame/dto';
import { getFrameCarats } from '@/api/frame/service';
import SearchableSelect from '@/components/shared/searchable-select';

interface FrameCaratSelectProps {
  value: FrameCaratDTO | null;
  setValue: React.Dispatch<React.SetStateAction<FrameCaratDTO | null>>;
  disabled?: boolean;
}
interface FrameMultiSelectProps {
  disabled: boolean;
  hasStar?: boolean;
  value: FrameCaratDTO[];
  setValue: React.Dispatch<React.SetStateAction<FrameCaratDTO[]>>;
}

const FrameCaratSelect: FunctionComponent<FrameCaratSelectProps> = ({
  value,
  setValue,
  disabled,
}) => {
  const { lang } = useLang();
  const { t } = useText('frameCarat', lang);

  return (
    <SearchableSelect<FrameCaratDTO>
      id={'frameCarat'}
      title={t('select.title')}
      hasStar
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getFrameCarats()) ?? [];
      }}
      optionLabel={(o) => o.amount}
      optionKey={(o) => o.value}
      filterMode={'local'}
      placeholder={t('select.placeholder')}
      validate={(v) => v !== null}
      disabled={disabled}
    />
  );
};

const FrameCaratMultiSelect: FunctionComponent<FrameMultiSelectProps> = ({
  disabled = false,
  hasStar = false,
  value,
  setValue,
}) => {
  const { lang } = useLang();
  const { t } = useText('frame', lang);

  return (
    <SearchableSelect<FrameCaratDTO>
      id={'carats'}
      title={t('select.carat.title')}
      multiple
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => (await getFrameCarats()) ?? []}
      optionLabel={(o) => o.amount}
      optionKey={(o) => o.value}
      filterMode={'local'}
      placeholder={t('select.carat.placeholder')}
      validate={(vals) => vals.length > 0}
      limitTags={3}
      disabled={disabled}
    />
  );
};

export { FrameCaratSelect, FrameCaratMultiSelect };
