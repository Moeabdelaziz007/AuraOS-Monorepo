export function helloCore() {
  return 'hello from core';
}

if (require.main === module) {
  // simple smoke: print the export
  // eslint-disable-next-line no-console
  console.log(helloCore());
}
export {};
