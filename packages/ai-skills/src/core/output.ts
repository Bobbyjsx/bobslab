/** Defines the terminal output boundary used by commands. */
export interface Output {
  error(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  success(message: string): void;
}

/** Writes command output to the process console with clear styling. */
export const consoleOutput: Output = {
  error(message) {
    console.error(`\x1b[31m✖\x1b[0m ${message}`);
  },
  info(message) {
    console.log(message);
  },
  warn(message) {
    console.warn(`\x1b[33m⚠\x1b[0m ${message}`);
  },
  success(message) {
    console.log(`\x1b[32m✔\x1b[0m ${message}`);
  },
};
