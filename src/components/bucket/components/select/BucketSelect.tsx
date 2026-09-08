'use client';

import { FunctionComponent } from 'react';
import { AdminBucketDTO } from '@/api/admin/bucket/dto';
import { getAdminBucket } from '@/api/admin/bucket/service';
import SearchableSelect from '@/components/shared/searchable-select';
import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';

interface BucketSelectProps {
  value: AdminBucketDTO | null;
  setValue: React.Dispatch<React.SetStateAction<AdminBucketDTO | null>>;
}

const BucketSelect: FunctionComponent<BucketSelectProps> = ({ value, setValue }) => {
  const { lang } = useLang();
  const { t } = useText('bucket', lang);

  return (
    <SearchableSelect<AdminBucketDTO>
      id={'bucket'}
      title={t('select.title')}
      hasStar
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getAdminBucket()) ?? [];
      }}
      optionLabel={(o) => o.name}
      optionSecondary={(o) => o.identifier}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('select.placeholder')}
      validate={(v) => v !== null}
    />
  );
};

export default BucketSelect;
