import { shared } from './shared';
import { home } from './home';
// Section dictionaries are spread in here as each section task lands.
export const EL: Record<string, string> = {
  ...shared,
  ...home,
};
