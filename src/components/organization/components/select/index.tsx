'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import SearchableSelect from '@/components/shared/searchable-select';
import { OrganizationDTO } from '@/api/admin/organization/dto';
import { getOrganizations } from '@/api/admin/organization/service';
import { useLang } from '@/hooks/LanContext';

interface OrganizationSelectProps {
  value: OrganizationDTO | null;
  setValue: React.Dispatch<React.SetStateAction<OrganizationDTO | null>>;
  disabled?: boolean;
  hasStar?: boolean;
  placeholder?: string;
}

interface OrganizationMultiSelectProps {
  value: OrganizationDTO[];
  setValue: React.Dispatch<React.SetStateAction<OrganizationDTO[]>>;
  disabled?: boolean;
  hasStar?: boolean;
  placeholder?: string;
}

const OrganizationSelect: FunctionComponent<OrganizationSelectProps> = ({
  value,
  setValue,
  disabled = false,
  hasStar = false,
  placeholder,
}) => {
  const { lang } = useLang();
  const { t } = useText('organization', lang);

  return (
    <SearchableSelect<OrganizationDTO>
      id={'organization'}
      title={t('select.title')}
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getOrganizations()) ?? [];
      }}
      optionLabel={(o) => o.faName}
      optionSecondary={(o) => o.enName}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={placeholder || t('select.placeholder')}
      validate={(v) => v !== null}
      disabled={disabled}
    />
  );
};

const OrganizationMultiSelect: FunctionComponent<OrganizationMultiSelectProps> = ({
  value,
  setValue,
  disabled = false,
  hasStar = false,
  placeholder,
}) => {
  const { lang } = useLang();
  const { t } = useText('organization', lang);

  return (
    <SearchableSelect<OrganizationDTO>
      id={'organizations'}
      title={t('select.title')}
      multiple
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getOrganizations()) ?? [];
      }}
      optionLabel={(o) => o.faName}
      optionSecondary={(o) => o.enName}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={placeholder || t('select.placeholder')}
      validate={(vals) => vals.length > 0}
      limitTags={3}
      disabled={disabled}
    />
  );
};

export { OrganizationSelect, OrganizationMultiSelect };