export interface SearchRequest {
  input: string;
  offset: number;
}

export function applyOffset(input: string, offset: number) {
  if (offset >= input.length) return input;

  const prefix = input.slice(0, offset);
  const nextSpace = input.indexOf(' ', offset);
  if (nextSpace > -1) {
    return prefix + input.slice(nextSpace);
  } else {
    return prefix;
  }
}
