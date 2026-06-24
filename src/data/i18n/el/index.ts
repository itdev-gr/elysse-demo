import { shared } from './shared';
import { home } from './home';
import { about } from './about';
// Section dictionaries are spread in here as each section task lands.
export const EL: Record<string, string> = {
  ...shared,
  ...home,
  ...about,
};
