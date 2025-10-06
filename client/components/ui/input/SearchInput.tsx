import { Input } from '@heroui/react';
import { Search01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface ISearchInputProps {
  placeholder?: string;
  className?: string;
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
}

export const SearchInput = (props: ISearchInputProps) => {
  const msg = useTranslations('msg');
  const { placeholder, className, value, onValueChange, label } = props;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (searchTerm !== value) setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onValueChange(searchTerm);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <Input
      placeholder={(placeholder ?? msg('search')) + '...'}
      labelPlacement="outside"
      aria-label="SearchInput"
      label={label}
      type="text"
      className={className}
      endContent={<Search01Icon size={16} />}
      value={searchTerm}
      onValueChange={(value) => {
        setSearchTerm(value);
      }}
    />
  );
};
