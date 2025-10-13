import { NumberInput } from '@heroui/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ExtButton } from '../button/ExtButton';

interface IPaginationInput {
  page: number;
  totalPage: number;
  onPageChange: (value: number) => void;
}

export const PaginationInput = (props: IPaginationInput) => {
  const msg = useTranslations('msg');
  const { page, totalPage, onPageChange } = props;
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [total, setTotal] = useState<number>(1);

  useEffect(() => {
    if (pageIndex !== page) {
      onPageChange(pageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  useEffect(() => {
    console.log('totalPage', totalPage);
    if (totalPage == 0) {
      const handleTotal = setTimeout(() => {
        setTotal(1);
        setPageIndex(1);
      }, 300);

      return () => {
        clearTimeout(handleTotal);
      };
    } else if (totalPage !== total) {
      setTotal(totalPage);
      setPageIndex(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPage]);

  return (
    <div className="flex items-center gap-2">
      <NumberInput
        classNames={{
          inputWrapper: 'py-0',
          input: 'w-8 text-center',
        }}
        hideStepper
        size="sm"
        aria-label="pagination"
        labelPlacement="outside-left"
        defaultValue={1}
        minValue={1}
        maxValue={total}
        value={pageIndex}
        onValueChange={(value) => {
          setPageIndex(value);
        }}
        startContent={
          <ExtButton
            isIconOnly
            disabled={pageIndex <= 1}
            color="transparent"
            size="sm"
            onPress={() => setPageIndex(pageIndex - 1)}
          >
            <ArrowLeft01Icon size={14} />
          </ExtButton>
        }
        endContent={
          <ExtButton
            isIconOnly
            disabled={pageIndex >= total}
            color="transparent"
            size="sm"
            onPress={() => setPageIndex(pageIndex + 1)}
          >
            <ArrowRight01Icon size={14} />
          </ExtButton>
        }
      />
      <span className="text-nowrap text-sm font-semibold">{`/ ${total} ${msg('page')}`}</span>
    </div>
  );
};
