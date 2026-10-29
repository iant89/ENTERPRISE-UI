import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Page } from '../../layouts/page';
import { Tabs, TabList, Tab, TabPanel } from '../../components/tabs';
import type { BreadcrumbItem } from '../../components/breadcrumbs';
import styles from './ObjectPage.module.css';

export interface ObjectPageSection {
  id: string;
  title: string;
  content: ReactNode;
}

export interface ObjectAttribute {
  label: string;
  value: ReactNode;
}

export interface ObjectPageProps {
  /** Object title, e.g. a product or purchase-order name. */
  title: ReactNode;
  /** Object type or identifier. */
  subtitle?: ReactNode;
  avatar?: ReactNode;
  /** Status next to the title (e.g. a StatusIndicator). */
  status?: ReactNode;
  breadcrumbs?: BreadcrumbItem[] | ReactNode;
  /** Object actions (Edit, Delete, …). */
  actions?: ReactNode;
  /** Key facts shown in the header. */
  attributes?: ObjectAttribute[];
  /** Additional header content (e.g. KPIs, a ProgressBar). */
  headerContent?: ReactNode;
  sections: ObjectPageSection[];
  /**
   * `anchors`: all sections on one scrolling page with an anchor bar that
   * tracks the visible section. `tabs`: one section at a time.
   * @default 'anchors'
   */
  navigation?: 'anchors' | 'tabs';
  onBack?: () => void;
  className?: string;
}

/**
 * Displays a single business object: header with title, status, key
 * attributes and actions, followed by sections reached through an anchor
 * bar or tabs. Built from Page and Tabs.
 */
export function ObjectPage({
  title, subtitle, avatar, status, breadcrumbs, actions, attributes, headerContent, sections, navigation = 'anchors', onBack, className,
}: ObjectPageProps) {
  const baseId = useId(undefined, 'object');
  const [activeSection, setActiveSection] = useState<string | undefined>(sections[0]?.id);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const clickLock = useRef(0);

  useEffect(() => {
    if (navigation !== 'anchors' || typeof IntersectionObserver === 'undefined') return;
    const elements = sections.map((s) => document.getElementById(`${baseId}-${s.id}`)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < clickLock.current) return;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.getAttribute('data-section-id') ?? undefined);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [navigation, sections, baseId]);

  const header = (attributes?.length || headerContent) && (
    <div className={styles.header}>
      {attributes && attributes.length > 0 && (
        <dl className={styles.attributes}>
          {attributes.map((a) => (
            <div key={a.label} className={styles.attribute}>
              <dt>{a.label}</dt>
              <dd>{a.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {headerContent && <div className={styles.kpis}>{headerContent}</div>}
    </div>
  );

  const goTo = (id: string) => {
    const el = document.getElementById(`${baseId}-${id}`);
    if (!el) return;
    clickLock.current = Date.now() + 800;
    setActiveSection(id);
    el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  };

  return (
    <Page
      className={className}
      title={title}
      subtitle={subtitle}
      avatar={avatar}
      titleAddon={status}
      breadcrumbs={breadcrumbs}
      actions={actions}
      headerContent={header || undefined}
      onBack={onBack}
    >
      {navigation === 'tabs' ? (
        <Tabs defaultValue={sections[0]?.id}>
          <TabList aria-label="Sections">
            {sections.map((s) => (
              <Tab key={s.id} value={s.id}>
                {s.title}
              </Tab>
            ))}
          </TabList>
          {sections.map((s) => (
            <TabPanel key={s.id} value={s.id}>
              {s.content}
            </TabPanel>
          ))}
        </Tabs>
      ) : (
        <>
          <nav className={styles.anchorBar} aria-label="Sections">
            <ul className={styles.anchorList}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${baseId}-${s.id}`}
                    className={styles.anchor}
                    aria-current={activeSection === s.id ? 'true' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(s.id);
                    }}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.sections}>
            {sections.map((s) => (
              <section key={s.id} id={`${baseId}-${s.id}`} data-section-id={s.id} className={cx(styles.section)} aria-labelledby={`${baseId}-${s.id}-title`}>
                <h2 id={`${baseId}-${s.id}-title`} className={styles.sectionTitle} tabIndex={-1}>
                  {s.title}
                </h2>
                {s.content}
              </section>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
