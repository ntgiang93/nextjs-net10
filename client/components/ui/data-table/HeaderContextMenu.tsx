import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from '@heroui/react';
import { Column } from '@tanstack/react-table';

interface HeaderContextMenu {
  column: Column<any>;
}

const HeaderContextMenu = (props: HeaderContextMenu) => {
  const { column } = props;
  return (
    <Dropdown
      className="border-1 bg-opacity-95 border-default-100 place-self-end"
      placement={'bottom-end'}
    >
      <DropdownTrigger>
        <Button isIconOnly radius="full" size="sm" variant="light"></Button>
      </DropdownTrigger>
      <DropdownMenu color={'default'} variant={'flat'}>
        <DropdownSection title={'Actions'} showDivider>
          <DropdownItem
            className={'border-none'}
            startContent={<Icon icon={'fluent:pin-12-regular'} fontSize={20} />}
            onClick={() => {
              if (column.getIsPinned()) column.pin(false);
              else column.pin('left');
            }}
          >
            {column.getIsPinned() ? 'Unpin' : 'Pin'}
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title={'Sort'}>
          <DropdownItem
            className={'hover:border-none'}
            startContent={
              <Icon
                icon={'fluent:arrow-sort-up-lines-20-filled'}
                fontSize={20}
              />
            }
            onClick={() => {}}
          >
            Ascending
          </DropdownItem>
          <DropdownItem
            startContent={
              <Icon
                icon={'fluent:arrow-sort-down-lines-20-filled'}
                fontSize={20}
              />
            }
            onClick={() => {}}
          >
            Descending
          </DropdownItem>
          <DropdownItem
            startContent={
              <Icon icon={'fluent:arrow-sort-28-filled'} fontSize={20} />
            }
            onClick={() => {}}
          >
            Unsort
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default HeaderContextMenu;
