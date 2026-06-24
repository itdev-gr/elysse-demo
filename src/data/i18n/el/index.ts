import { shared } from './shared';
import { home } from './home';
import { about } from './about';
import { services } from './services';
import { contact } from './contact';
// Section dictionaries are spread in here as each section task lands.
export const EL: Record<string, string> = {
  ...shared,
  ...home,
  ...about,
  ...services,
  ...contact,
};
