const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
const SPLIT_REPLACE_VALUE = "$1\0$2";
const TRIM_NON_ALPHA_RE = /^[^\p{L}]+/u;

type Factory = (input: string) => string;

const lowerFactory: Factory = (input) => input.toLowerCase();
const upperFactory: Factory = (input) => input.toUpperCase();

const capitalCaseTransformFactory = (
  lower: Factory,
  upper: Factory,
): Factory => {
  return (word: string) => {
    if (word.length <= 1) {
      return word;
    }
    return `${upper(word[0])}${lower(word.slice(1))}`;
  };
};

const split = (input: string): string[] => {
  let result = input.trim();

  result = result.replace(TRIM_NON_ALPHA_RE, "");

  result = result
    .replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE)
    .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);

  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");

  return result.split(/\0/g);
};

export const sentenceCase = (input: string): string => {
  if (input.length === 0) {
    return input;
  }

  const transform = capitalCaseTransformFactory(lowerFactory, upperFactory);
  const result = split(input)
    .map((word, index) => {
      if (index === 0) return transform(word);
      return lowerFactory(word);
    })
    .join(" ");

  return result;
};
