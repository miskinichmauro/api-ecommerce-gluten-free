import slugify from '@sindresorhus/slugify';

export function normalizeSlug(input: string): string {
  if (!input) {
    return '';
  }

  let s = slugify(input, { separator: '-' });
  s = s.replace(/[/\\?%*:|"<>]/g, '');
  return s;
}
