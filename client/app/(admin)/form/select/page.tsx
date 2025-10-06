'use client';
import { Card, CardBody, CardFooter, Divider, Link } from '@heroui/react';
import { PageHeader } from '@/components/ui//navigate/PageHeader';
import { TreeItem, TreeSelect } from '@/components/ui//hierarchy/TreeSelect';
import React from 'react';
import { ListBoxTree } from '@/components/ui//hierarchy/ListBoxTree';

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

  return (
    <div className={'h-full flex flex-col gap-2'}>
      <PageHeader title={'Select'} />
      <Card className={'h-full'}>
        <Divider />
        <CardBody>
          <p className={'text-xl font-semibold'}>Tree select</p>
          <div className={'flex flex-row gap-3 w-full border rounded-lg p-3'}>
            <TreeSelect items={mockTreeData} />
            <ListBoxTree items={mockTreeData} color={'primary'} />
          </div>
          <p className={'text-xl font-semibold'}>Tree listbox</p>
          <div className={'flex flex-row gap-3 w-full border rounded-lg p-3 h-96'}>
            <ListBoxTree items={mockTreeData} color={undefined} />
          </div>
        </CardBody>
        <Divider />
        <CardFooter>
          <Link isExternal showAnchorIcon href="https://github.com/heroui-inc/heroui">
            Visit source code on GitHub.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
