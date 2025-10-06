'use client';
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  Code,
  Divider,
  Link,
  Tab,
} from '@heroui/react';
import { PageHeader } from '@/components/ui//navigate/PageHeader';
import { TreeItem } from '@/components/ui//hierarchy/TreeItem';
import React from 'react';
import { ListBoxTree } from '@/components/ui//hierarchy/ListBoxTree';
import { Tabs } from '@heroui/tabs';
import { Radio, RadioGroup } from '@heroui/radio';
import TreeList from '@/components/ui//tree/TreeList';

export default function Select() {
  const mockTreeData: TreeItem[] = [
    {
      value: 'root',
      label: 'Root Node',
      children: [
        {
          value: 'child-1',
          label: 'Child Node 1',
          children: [
            {
              value: 'child-1-1',
              label: 'Child Node 1.1',
              children: [],
            },
            {
              value: 'child-1-2',
              label: 'Child Node 1.2',
              children: [
                {
                  value: 'child-1-2-1',
                  label: 'Child Node 1.2.1',
                  children: [],
                },
              ],
            },
          ],
        },
        {
          value: 'child-2',
          label: 'Child Node 2',
          children: [
            {
              value: 'child-2-1',
              label: 'Child Node 2.1',
              children: [],
            },
          ],
        },
        {
          value: 'child-3',
          label: 'Child Node 3',
          children: [],
        },
      ],
    },
    {
      value: 'root2',
      label: 'Root Node2',
      children: [
        {
          value: 'child-21',
          label: 'Child Node 21',
          children: [],
        },
        {
          value: 'child-22',
          label: 'Child Node 22',
          children: [
            {
              value: 'child-22-1',
              label: 'Child Node 22.1',
              children: [],
            },
          ],
        },
        {
          value: 'child-23',
          label: 'Child Node 3',
          children: [],
        },
      ],
    },
  ];
  const [selectedVariant, setSelectedVariant] = React.useState<any>('shadow');
  const [selectedColor, setSelectedColor] = React.useState<any>('default');

  const variants = ['solid', 'bordered', 'flat', 'shadow'];
  const colors = [
    'default',
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
  ];

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader title={'Select'} />
      <Card className={'h-full'}>
        <Divider />
        <CardBody>
          <Button
            variant="flat"
            onPress={() => {
              addToast({
                title: 'Toast Title',
              });
            }}
          >
            Default
          </Button>
          <p className={'text-xl font-semibold'}>Tree List box</p>
          <Tabs aria-label="Tabs variants" variant={'underlined'}>
            <Tab key="Basic" title="Basic">
              <div
                className={
                  'flex flex-row gap-3 w-80 border rounded-lg p-3 h-72'
                }
              >
                <ListBoxTree items={mockTreeData} />
              </div>
            </Tab>
            <Tab key="Variants" title="Variants">
              <div
                className={
                  'flex flex-row gap-3 w-2/3 border rounded-lg p-3 h-72'
                }
              >
                <div className={'w-1/3 h-72'}>
                  <ListBoxTree
                    items={mockTreeData}
                    color={selectedColor}
                    variant={selectedVariant}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <RadioGroup
                    color={selectedVariant as any}
                    defaultValue="solid"
                    label="Select item variant"
                    orientation="horizontal"
                    onValueChange={setSelectedVariant}
                  >
                    {variants.map((variant) => (
                      <Radio
                        key={variant}
                        className="capitalize"
                        value={variant}
                      >
                        {variant}
                      </Radio>
                    ))}
                  </RadioGroup>
                  <RadioGroup
                    color={selectedColor as any}
                    defaultValue="default"
                    label="Select item color"
                    orientation="horizontal"
                    onValueChange={setSelectedColor}
                  >
                    {colors.map((color) => (
                      <Radio key={color} className="capitalize" value={color}>
                        {color}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </Tab>
            <Tab key="TreeList" title="Tree List">
              <div
                className={
                  'flex flex-row gap-3 w-80 border rounded-lg p-3 h-72'
                }
              >
                <TreeList items={mockTreeData} />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
        <Divider />
      </Card>
    </div>
  );
}
