import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Button from './Button.astro';

test('renders primary button with label and variant class', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, {
    props: { variant: 'primary' },
    slots: { default: 'Click me' },
  });
  expect(html).toContain('Click me');
  expect(html).toMatch(/<button\b/);
  expect(html).toMatch(/class="[^"]*btn-primary/);
});

test('renders as <a> when href is provided', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, {
    props: { href: '/contact' },
    slots: { default: 'Contact us' },
  });
  expect(html).toContain('Contact us');
  expect(html).toContain('<a');
  expect(html).toContain('href="/contact"');
  expect(html).not.toMatch(/<button\b/);
});

test('applies secondary variant class', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, {
    props: { variant: 'secondary' },
    slots: { default: 'More' },
  });
  expect(html).toMatch(/btn-secondary/);
});

test('applies size class for "lg"', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, {
    props: { size: 'lg' },
    slots: { default: 'Big' },
  });
  expect(html).toMatch(/btn-lg|text-lg|py-3/);
});

test('disabled attribute applied to button', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, {
    props: { disabled: true },
    slots: { default: 'Wait' },
  });
  expect(html).toContain('disabled');
});

test('type defaults to button (not submit)', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, {
    props: {},
    slots: { default: 'Default' },
  });
  expect(html).toContain('type="button"');
});

test('ariaLabel propagates', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Button, {
    props: { ariaLabel: 'Open menu' },
    slots: { default: 'Menu' },
  });
  expect(html).toContain('aria-label="Open menu"');
});
