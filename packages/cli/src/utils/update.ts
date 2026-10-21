/** Gets the latest package version without making update checks fatal. */
export const getLatestPackageVersion = async (
  packageName: string,
): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
      {
        signal: AbortSignal.timeout(1500),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.version;
  } catch {
    return null;
  }
};

/** Compares stable semantic version triplets. */
export const isNewerVersion = (latest: string, current: string): boolean => {
  const parse = (value: string): [number, number, number] => {
    const parts = value.replace(/^v/, "").split(".").map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  };
  const [lMajor, lMinor, lPatch] = parse(latest);
  const [cMajor, cMinor, cPatch] = parse(current);

  if (lMajor > cMajor) return true;
  if (lMajor < cMajor) return false;
  if (lMinor > cMinor) return true;
  if (lMinor < cMinor) return false;
  return lPatch > cPatch;
};
