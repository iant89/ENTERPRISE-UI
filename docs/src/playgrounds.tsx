import { Plus } from 'lucide-react';
import {
  Avatar, Badge, Button, Card, Input, MessageStrip, MetricCard, ProgressBar, Spinner, StatusIndicator, Switch, type Tone,
} from '@enterprise-ui/react';
import { jsx, type PlaygroundDef } from './components/Playground';

const tones = ['neutral', 'information', 'success', 'warning', 'error'];
const imp = (names: string) => `import { ${names} } from '@enterprise-ui/react';\n\n`;

export const playgrounds: Record<string, PlaygroundDef> = {
  button: {
    controls: [
      { name: 'variant', type: 'select', options: ['primary', 'secondary', 'tertiary', 'destructive'], default: 'primary' },
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'label', type: 'text', default: 'Save changes' },
      { name: 'icon', type: 'boolean', default: false },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'fullWidth', type: 'boolean', default: false },
    ],
    render: (v) => (
      <Button variant={v.variant as 'primary'} size={v.size as 'md'} icon={v.icon ? <Plus /> : undefined} loading={!!v.loading} disabled={!!v.disabled} fullWidth={!!v.fullWidth}>
        {String(v.label)}
      </Button>
    ),
    code: (v) =>
      (v.icon ? `import { Plus } from 'lucide-react';\n` : '') +
      imp('Button') +
      jsx('Button', { variant: v.variant, size: v.size, icon: v.icon ? '__icon__' : undefined, loading: v.loading, disabled: v.disabled, fullWidth: v.fullWidth }, { variant: 'secondary', size: 'md', loading: false, disabled: false, fullWidth: false }, String(v.label)).replace(
        'icon="__icon__"',
        'icon={<Plus />}',
      ),
  },
  input: {
    controls: [
      { name: 'label', type: 'text', default: 'Supplier name' },
      { name: 'placeholder', type: 'text', default: 'e.g. Northwind' },
      { name: 'description', type: 'text', default: '' },
      { name: 'status', type: 'select', options: ['none', 'error', 'warning', 'success', 'information'], default: 'none' },
      { name: 'statusMessage', type: 'text', default: 'Check this value.' },
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'required', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'readOnly', type: 'boolean', default: false },
    ],
    render: (v) => (
      <div style={{ width: 320 }}>
        <Input
          label={String(v.label)}
          placeholder={String(v.placeholder)}
          description={String(v.description) || undefined}
          status={v.status as 'none'}
          statusMessage={String(v.statusMessage)}
          size={v.size as 'md'}
          required={!!v.required}
          disabled={!!v.disabled}
          readOnly={!!v.readOnly}
        />
      </div>
    ),
    code: (v) =>
      imp('Input') +
      jsx(
        'Input',
        { label: v.label, placeholder: v.placeholder, description: v.description, status: v.status, statusMessage: v.status === 'none' ? undefined : v.statusMessage, size: v.size, required: v.required, disabled: v.disabled, readOnly: v.readOnly },
        { status: 'none', size: 'md', required: false, disabled: false, readOnly: false },
      ),
  },
  badge: {
    controls: [
      { name: 'label', type: 'text', default: 'Overdue' },
      { name: 'tone', type: 'select', options: tones, default: 'warning' },
      { name: 'solid', type: 'boolean', default: false },
    ],
    render: (v) => <Badge tone={v.tone as Tone} solid={!!v.solid}>{String(v.label)}</Badge>,
    code: (v) => imp('Badge') + jsx('Badge', { tone: v.tone, solid: v.solid }, { tone: 'neutral', solid: false }, String(v.label)),
  },
  'status-indicator': {
    controls: [
      { name: 'label', type: 'text', default: 'Approved' },
      { name: 'tone', type: 'select', options: tones, default: 'success' },
      { name: 'indicator', type: 'select', options: ['icon', 'dot', 'none'], default: 'icon' },
      { name: 'inverted', type: 'boolean', default: false },
      { name: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
    ],
    render: (v) => (
      <StatusIndicator tone={v.tone as Tone} indicator={v.indicator as 'icon'} inverted={!!v.inverted} size={v.size as 'md'}>
        {String(v.label)}
      </StatusIndicator>
    ),
    code: (v) => imp('StatusIndicator') + jsx('StatusIndicator', { tone: v.tone, indicator: v.indicator, inverted: v.inverted, size: v.size }, { tone: 'neutral', indicator: 'icon', inverted: false, size: 'md' }, String(v.label)),
  },
  'message-strip': {
    controls: [
      { name: 'tone', type: 'select', options: tones, default: 'warning' },
      { name: 'title', type: 'text', default: 'Budget alert:' },
      { name: 'text', type: 'text', default: '92% of the quarterly budget is used.' },
      { name: 'dismissible', type: 'boolean', default: true },
      { name: 'hideIcon', type: 'boolean', default: false },
    ],
    render: (v) => (
      <MessageStrip key={JSON.stringify(v)} tone={v.tone as Tone} title={String(v.title) || undefined} dismissible={!!v.dismissible} hideIcon={!!v.hideIcon} style={{ width: '100%' }}>
        {String(v.text)}
      </MessageStrip>
    ),
    code: (v) => imp('MessageStrip') + jsx('MessageStrip', { tone: v.tone, title: v.title, dismissible: v.dismissible, hideIcon: v.hideIcon }, { tone: 'information', dismissible: false, hideIcon: false }, String(v.text)),
  },
  avatar: {
    controls: [
      { name: 'name', type: 'text', default: 'Ada Lovelace' },
      { name: 'size', type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'lg' },
      { name: 'shape', type: 'select', options: ['circle', 'square'], default: 'circle' },
      { name: 'presence', type: 'select', options: ['none', 'online', 'away', 'busy', 'offline'], default: 'online' },
    ],
    render: (v) => <Avatar name={String(v.name)} size={v.size as 'md'} shape={v.shape as 'circle'} presence={v.presence === 'none' ? undefined : (v.presence as 'online')} />,
    code: (v) => imp('Avatar') + jsx('Avatar', { name: v.name, size: v.size, shape: v.shape, presence: v.presence === 'none' ? undefined : v.presence }, { size: 'md', shape: 'circle' }),
  },
  switch: {
    controls: [
      { name: 'label', type: 'text', default: 'Email notifications' },
      { name: 'labelPlacement', type: 'select', options: ['end', 'start'], default: 'end' },
      { name: 'showStateText', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (v) => <Switch label={String(v.label)} labelPlacement={v.labelPlacement as 'end'} showStateText={!!v.showStateText} disabled={!!v.disabled} defaultChecked />,
    code: (v) => imp('Switch') + jsx('Switch', { label: v.label, labelPlacement: v.labelPlacement, showStateText: v.showStateText, disabled: v.disabled, defaultChecked: true }, { labelPlacement: 'end', showStateText: false, disabled: false }),
  },
  'progress-bar': {
    controls: [
      { name: 'label', type: 'text', default: 'Upload' },
      { name: 'value', type: 'number', default: 45, min: 0, max: 100 },
      { name: 'indeterminate', type: 'boolean', default: false },
      { name: 'tone', type: 'select', options: tones, default: 'information' },
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
    render: (v) => (
      <div style={{ width: 360 }}>
        <ProgressBar label={String(v.label)} value={v.indeterminate ? undefined : Number(v.value)} tone={v.tone as Tone} size={v.size as 'md'} />
      </div>
    ),
    code: (v) => imp('ProgressBar') + jsx('ProgressBar', { label: v.label, value: v.indeterminate ? undefined : v.value, tone: v.tone, size: v.size }, { tone: 'information', size: 'md' }),
  },
  spinner: {
    controls: [
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'label', type: 'text', default: 'Loading orders' },
      { name: 'showLabel', type: 'boolean', default: true },
    ],
    render: (v) => <Spinner size={v.size as 'md'} label={String(v.label)} showLabel={!!v.showLabel} />,
    code: (v) => imp('Spinner') + jsx('Spinner', { size: v.size, label: v.label, showLabel: v.showLabel }, { size: 'md', label: 'Loading', showLabel: false }),
  },
  card: {
    controls: [
      { name: 'title', type: 'text', default: 'Sales Overview' },
      { name: 'subtitle', type: 'text', default: 'October 2026' },
      { name: 'flat', type: 'boolean', default: false },
      { name: 'selected', type: 'boolean', default: false },
      { name: 'headerDivider', type: 'boolean', default: false },
      { name: 'footer', type: 'boolean', default: true },
    ],
    render: (v) => (
      <Card
        style={{ width: 320 }}
        title={String(v.title)}
        subtitle={String(v.subtitle) || undefined}
        flat={!!v.flat}
        selected={!!v.selected}
        headerDivider={!!v.headerDivider}
        footer={v.footer ? <Button size="sm" variant="primary">View Report</Button> : undefined}
      >
        <p style={{ margin: 0 }}>Total revenue: $125,430</p>
      </Card>
    ),
    code: (v) =>
      imp('Button, Card') +
      `<Card\n  title="${v.title}"${v.subtitle ? `\n  subtitle="${v.subtitle}"` : ''}${v.flat ? '\n  flat' : ''}${v.selected ? '\n  selected' : ''}${v.headerDivider ? '\n  headerDivider' : ''}${
        v.footer ? '\n  footer={<Button size="sm" variant="primary">View Report</Button>}' : ''
      }\n>\n  <p>Total revenue: $125,430</p>\n</Card>`,
  },
  'metric-card': {
    controls: [
      { name: 'title', type: 'text', default: 'Revenue' },
      { name: 'value', type: 'text', default: '1.24' },
      { name: 'unit', type: 'text', default: 'M USD' },
      { name: 'tone', type: 'select', options: ['none', 'information', 'success', 'warning', 'error'], default: 'none' },
      { name: 'trend', type: 'select', options: ['up', 'down', 'flat'], default: 'up' },
      { name: 'sparkline', type: 'boolean', default: true },
      { name: 'loading', type: 'boolean', default: false },
    ],
    render: (v) => (
      <MetricCard
        style={{ width: 300 }}
        title={String(v.title)}
        value={String(v.value)}
        unit={String(v.unit) || undefined}
        tone={v.tone === 'none' ? undefined : (v.tone as 'success')}
        trend={{ direction: v.trend as 'up', value: v.trend === 'flat' ? '±0' : v.trend === 'up' ? '+8.2%' : '−3.1%', label: 'vs. last month' }}
        sparkline={v.sparkline ? [8, 9, 7, 10, 11, 10, 12, 13] : undefined}
        loading={!!v.loading}
      />
    ),
    code: (v) =>
      imp('MetricCard') +
      `<MetricCard\n  title="${v.title}"\n  value="${v.value}"${v.unit ? `\n  unit="${v.unit}"` : ''}${v.tone !== 'none' ? `\n  tone="${v.tone}"` : ''}\n  trend={{ direction: '${v.trend}', value: '${v.trend === 'flat' ? '±0' : v.trend === 'up' ? '+8.2%' : '−3.1%'}', label: 'vs. last month' }}${
        v.sparkline ? '\n  sparkline={[8, 9, 7, 10, 11, 10, 12, 13]}' : ''
      }${v.loading ? '\n  loading' : ''}\n/>`,
  },
};
