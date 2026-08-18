// oxlint-disable-next-line func-style
function assert(condition: boolean, error: Error): asserts condition {
  if (!condition) {
    throw error;
  }
}

export const assertGreaterThan = (value: number, min: number, label: string = "Value"): void =>
  assert(value > min, new RangeError(`${label} (${value}) must be greater than ${min}.`));

export const assertLessThanOrEqual = (value: number, max: number, label: string = "Value"): void =>
  assert(value <= max, new RangeError(`${label} (${value}) must be less than or equal to ${max}.`));

export const assertEqualTo = <T>(value: T, expected: T, label: string = "Value"): void =>
  assert(value === expected, new RangeError(`${label} (${value}) must be equal to ${expected}.`));

export const assertStartsWith = (value: string, prefix: string, label: string = "Value"): void =>
  assert(value.startsWith(prefix), new Error(`${label} ("${value}") must start with "${prefix}".`));

export const assertIsAlphanumeric = (value: string, label: string = "Value"): void =>
  assert(
    /^[a-z0-9]+$/.test(value),
    new Error(`${label} ("${value}") must contain only lowercase letters and numbers (a-z, 0-9).`)
  );

export const assertMatchesOneOf = <T>(
  value: T,
  items: readonly T[],
  predicate: (value: T, item: T) => boolean,
  label: string = "Value"
): void =>
  assert(
    items.some(item => predicate(value, item)),
    new Error(`${label} ("${value}") must match one of: ${items.join(", ")}.`)
  );

export const assertDoesNotMatchAnyOf = <T>(
  value: T,
  items: readonly T[],
  predicate: (value: T, item: T) => boolean,
  label: string = "Value"
): void =>
  assert(
    !items.some(item => predicate(value, item)),
    new Error(`${label} ("${value}") must not match any of: ${items.join(", ")}.`)
  );

export const assertIncludes = (value: string, substring: string, label: string = "Value"): void =>
  assert(
    value.includes(substring),
    new Error(`${label} ("${value}") must include "${substring}".`)
  );
