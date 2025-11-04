import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

interface ISidebarProps {
  isCompact: boolean;
  brandName: string;
}

export const Brand = (props: ISidebarProps) => {
  const { isCompact, brandName } = props;

  return (
    <Link href={'/'} className={'h-10 flex relative mx-2 items-center gap-3'}>
      <Image alt="Logo" height={24} src={'/logo.png'} width={24} />
      <p
        className={clsx(
          'font-bold text-xl text-inherit text-nowrap transition-opacity duration-300',
          `${isCompact ? 'opacity-0' : 'opacity-100'}`,
        )}
      >
        {brandName}
      </p>
    </Link>
  );
};
