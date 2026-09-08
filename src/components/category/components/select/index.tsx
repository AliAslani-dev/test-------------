'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import SearchableSelect from '@/components/shared/searchable-select';
import { FrameCategoryDTO, FrameGenderCategoryDTO } from '@/api/frame/dto';
import { getFrameCategories, getFrameGenderCategories } from '@/api/frame/service';
import { useLang } from '@/hooks/LanContext';

interface CategorySelectProps {
  value: FrameCategoryDTO | null;
  setValue: React.Dispatch<React.SetStateAction<FrameCategoryDTO | null>>;
  disabled: boolean;
  hasStar?: boolean;
}

interface GenderCategorySelectProps {
  value: FrameGenderCategoryDTO | null;
  setValue: React.Dispatch<React.SetStateAction<FrameGenderCategoryDTO | null>>;
  disabled: boolean;
  hasStar?: boolean;
}
interface CategoryMultiSelectProps {
  disabled: boolean;
  hasStar?: boolean;
  value: FrameCategoryDTO[];
  setValue: React.Dispatch<React.SetStateAction<FrameCategoryDTO[]>>;
}

const CategorySelect: FunctionComponent<CategorySelectProps> = ({
  value,
  setValue,
  disabled = false,
  hasStar = false,
}) => {
  const { lang } = useLang();
  const { t } = useText('category', lang);

  return (
    <SearchableSelect<FrameCategoryDTO>
      id={'category'}
      title={t('select.title')}
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getFrameCategories()) ?? [];
      }}
      optionLabel={(o) => o.faName}
      optionSecondary={(o) => o.enName}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('select.placeholder')}
      validate={(v) => v !== null}
      disabled={disabled}
    />
  );
};

const GenderCategorySelect: FunctionComponent<GenderCategorySelectProps> = ({
  value,
  setValue,
  disabled = false,
  hasStar = false,
}) => {
  const { lang } = useLang();
  const { t } = useText('category', lang);

  return (
    <SearchableSelect<FrameGenderCategoryDTO>
      id={'genderCategory'}
      title={t('gender_select.title')}
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => {
        return (await getFrameGenderCategories()) ?? [];
      }}
      optionLabel={(o) => o.faName}
      optionSecondary={(o) => o.enName}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('gender_select.placeholder')}
      validate={(v) => v !== null}
      disabled={disabled}
    />
  );
};

const CategoryMultiSelect: FunctionComponent<CategoryMultiSelectProps> = ({
  disabled = false,
  hasStar = false,
  value,
  setValue,
}) => {
  const { lang } = useLang();
  const { t } = useText('category', lang);

  return (
    <SearchableSelect<FrameCategoryDTO>
      id={'categories'}
      title={t('select.title')}
      multiple
      hasStar={hasStar}
      value={value}
      onChange={setValue}
      loadOptions={async () => (await getFrameCategories()) ?? []}
      optionLabel={(o) => o.faName}
      optionSecondary={(o) => o.enName}
      optionKey={(o) => o.id}
      filterMode={'local'}
      placeholder={t('select.placeholder')}
      validate={(vals) => vals.length > 0}
      limitTags={3}
      disabled={disabled}
    />
  );
};

export { CategorySelect, GenderCategorySelect, CategoryMultiSelect };
