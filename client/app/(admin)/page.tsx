'use client';
import { TreeList, TreeListItem } from '@/components/ui/tree/TreeList';
import { Card, CardBody, CardHeader, Chip, Select, SelectItem } from '@heroui/react';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

export default function Home() {
  const teamStructure = useMemo<TreeListItem[]>(
    () => [
      {
        id: 'product-ops',
        title: 'Product & Operations',
        description: 'Discovery, roadmap planning, and program delivery.',
        children: [
          {
            id: 'product-design',
            title: 'Product Design',
            description: 'Design system, UX research, accessibility checks.',
            children: [
              {
                id: 'design-system',
                title: 'Design System',
                description: 'Maintains tokens, interactions, and documentation.',
              },
              {
                id: 'ux-research',
                title: 'UX Research',
                description: 'Runs user interviews and collects qualitative feedback.',
              },
            ],
          },
          {
            id: 'delivery-ops',
            title: 'Delivery Operations',
            description: 'Sprint planning, release management, and retrospectives.',
          },
        ],
      },
      {
        id: 'engineering',
        title: 'Engineering',
        description: 'Platform stability, application development, and QA.',
        children: [
          {
            id: 'frontend',
            title: 'Frontend Guild',
            description: 'UI platform, shared components, and performance budgets.',
            children: [
              {
                id: 'client-experience',
                title: 'Client Experience',
                description: 'Builds dashboard features and onboarding flows.',
              },
            ],
          },
          {
            id: 'backend',
            title: 'Backend Guild',
            description: 'Domain services, integrations, and observability.',
            children: [
              {
                id: 'billing',
                title: 'Billing Services',
                description: 'Owns invoicing, payments, and ledger jobs.',
              },
              {
                id: 'reporting',
                title: 'Reporting APIs',
                description: 'Delivers exports, analytics APIs, and data syncs.',
              },
            ],
          },
        ],
      },
    ],
    [],
  );

  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple' | 'read-only'>(
    'multiple',
  );
  const [selectionStrategy, setSelectionStrategy] = useState<'leaf' | 'all'>('leaf');
  const [selectedIds, setSelectedIds] = useState<string[]>(['client-experience']);

  const itemLookup = useMemo(() => {
    const map: Record<string, TreeListItem> = {};
    const stack = [...teamStructure];
    while (stack.length) {
      const node = stack.pop();
      if (node) {
        map[node.id] = node;
        if (node.children?.length) {
          stack.push(...node.children);
        }
      }
    }
    return map;
  }, [teamStructure]);

  const selectedLabels = useMemo(
    () => selectedIds.map((id) => ({ id, label: itemLookup[id]?.title ?? id })),
    [itemLookup, selectedIds],
  );

  const handleSelectionModeChange = (mode: 'single' | 'multiple') => {
    setSelectionMode(mode);
    if (mode === 'single') {
      setSelectedIds((prev) => (prev.length > 0 ? [prev[0]] : []));
    }
  };

  const handleSelectionStrategyChange = (strategy: 'leaf' | 'all') => {
    setSelectionStrategy(strategy);
    if (strategy === 'leaf') {
      setSelectedIds((prev) => prev.filter((id) => !itemLookup[id]?.children?.length));
    }
  };

  const handleSelectionChange = (values: (string | number)[] | string | number) => {
    setSelectedIds((prev) => {
      if (Array.isArray(values)) {
        return values.map((v) => String(v));
      }
      if (selectionMode === 'single') {
        return [String(values)];
      }
      return [...prev, String(values)];
    });
  };

  return (
    <div className={clsx(`text-foreground bg-background`, 'min-h-screen flex flex-col gap-6')}>
      <Card shadow="sm" className="border border-default/20 bg-content1/60">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Team Structure Demo</h2>
            <p className="text-sm text-foreground-500">
              Nested HeroUI list with Framer Motion transitions.
            </p>
          </div>
          <div className="flex gap-3">
            <Chip color="primary" variant="flat" className="uppercase tracking-wide">
              {selectionMode === 'multiple' ? 'Multi-select' : 'Single-select'}
            </Chip>
            <Chip color="secondary" variant="flat" className="uppercase tracking-wide">
              {selectionStrategy === 'leaf' ? 'Leaf-only' : 'All nodes'}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Selection mode"
              size="sm"
              selectedKeys={[selectionMode]}
              onChange={(event) =>
                handleSelectionModeChange(event.target.value as 'single' | 'multiple')
              }
            >
              <SelectItem key="single">Single</SelectItem>
              <SelectItem key="multiple">Multiple</SelectItem>
            </Select>
            <Select
              label="Selection strategy"
              size="sm"
              selectedKeys={[selectionStrategy]}
              onChange={(event) =>
                handleSelectionStrategyChange(event.target.value as 'leaf' | 'all')
              }
            >
              <SelectItem key="leaf">Leaf nodes only</SelectItem>
              <SelectItem key="all">All nodes</SelectItem>
            </Select>
          </div>
          <TreeList
            items={teamStructure}
            defaultExpandedIds={['product-ops', 'engineering']}
            selectionMode={selectionMode}
            selectionStrategy={selectionStrategy}
            selectedIds={selectedIds}
            onSelectionChange={(values) => handleSelectionChange(values)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">Selected:</span>
            {selectedLabels.length > 0 ? (
              selectedLabels.map(({ id, label }) => (
                <Chip key={id} variant="flat" size="sm">
                  {label}
                </Chip>
              ))
            ) : (
              <span className="text-sm text-foreground-400">No items selected</span>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
