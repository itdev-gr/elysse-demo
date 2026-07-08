import { shared } from './shared';
import { home } from './home';
import { about } from './about';
import { services } from './services';
import { contact } from './contact';
import { innovation } from './innovation';
import { insights } from './insights';
import { green } from './green';
import { legal } from './legal';
import { catalog } from './catalog';
// Section dictionaries are spread in here as each section task lands.
export const DE: Record<string, string> = {
  ...shared,
  ...home,
  ...about,
  ...services,
  ...contact,
  ...innovation,
  ...insights,
  ...green,
  ...legal,
  ...catalog,
};
