import { createRng } from './seededRandom';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateGameCode(length = 6): string {
  const rng = createRng(`${Date.now()}-${Math.random()}`);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[rng.int(0, CODE_CHARS.length - 1)];
  }
  return code;
}