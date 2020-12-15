export interface PredictionSubstring {
  length: number;
  offset: number;
}

export interface Splits {
  text: string;
  match: boolean;
}

export function splitString(
  title: string,
  matched: readonly PredictionSubstring[],
): Splits[] {
  if (matched.length === 0) {
    return [{ text: title, match: false }];
  }

  let offset = 0;
  let result: Splits[] = [];
  for (const match of matched) {
    if (offset < match.offset) {
      result.push({ text: title.slice(offset, match.offset), match: false });
    }
    result.push({
      text: title.slice(match.offset, match.length),
      match: true,
    });
    offset = match.offset + match.length;
  }

  if (offset < title.length - 1) {
    result.push({ text: title.slice(offset), match: false });
  }

  return result;
}
