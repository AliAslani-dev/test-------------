'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import { CityDTO, ProvinceDTO, UserDTO } from '@/api/admin/user/dto';
import { getCities, getProvinces, getUsers } from '@/api/admin/user/service';
import SearchableSelect from '@/components/shared/searchable-select';
import { useLang } from '@/hooks/LanContext';

interface UserSelectProps {
  value: UserDTO | null;
  setValue: React.Dispatch<React.SetStateAction<UserDTO | null>>;
  disabled?: boolean;
  hasStar?: boolean;
}

interface ProvinceSelectProps {
  value: ProvinceDTO | null;
  setValue: React.Dispatch<React.SetStateAction<ProvinceDTO | null>>;
  disabled?: boolean;
  hasStar?: boolean;
}

interface CitySelectProps {
  value: CityDTO | null;
  setValue: React.Dispatch<React.SetStateAction<CityDTO | null>>;
  province: string | null;
  disabled?: boolean;
  hasStar?: boolean;
}

const UserSelect: FunctionComponent<UserSelectProps> = ({
  value,
  setValue,
  disabled,
  hasStar = false,
}) => {
  const { lang } = useLang();
  const { t } = useText('user', lang);

  return (
    <SearchableSelect<UserDTO>
      id={'user'}
      title={t('select.title')}
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getUsers()) ?? [];
      }}
      optionLabel={(o) => o.username}
      optionSecondary={(o) => o.email}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('select.placeholder')}
      validate={(v) => v !== null}
      disabled={disabled}
    />
  );
};

const ProvinceSelect: FunctionComponent<ProvinceSelectProps> = ({
  value,
  setValue,
  disabled,
  hasStar = false,
}) => {
  const { lang } = useLang();
  const { t } = useText('user', lang);

  return (
    <SearchableSelect<ProvinceDTO>
      id={'province'}
      title={t('province_select.title')}
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getProvinces()) ?? [];
      }}
      optionLabel={(o) => o.name}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('province_select.placeholder')}
      validate={(v) => v !== null}
      disabled={disabled}
    />
  );
};

const CitySelect: FunctionComponent<CitySelectProps> = ({
  value,
  setValue,
  province,
  disabled,
  hasStar = false,
}) => {
  const { lang } = useLang();
  const { t } = useText('user', lang);

  return (
    <SearchableSelect<CityDTO>
      key={province ?? 'city'}
      id={'city'}
      title={t('city_select.title')}
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        if (!province) return [];
        return (await getCities(province)) ?? [];
      }}
      optionLabel={(o) => o.name}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('city_select.placeholder')}
      disabled={disabled || !province}
    />
  );
};

export { UserSelect, ProvinceSelect, CitySelect };
