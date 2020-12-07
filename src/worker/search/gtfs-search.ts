import FlexSearch from 'flexsearch';
import { applyOffset } from './helpers';

const index = FlexSearch.create({
  encode: 'advanced',
  tokenize: 'reverse',
  cache: true,
  async: true,
});

/**
 *
 * @param input The text string on which to search.
 * @param offset The position, in the input term, of the last character that
 * the service uses to match predictions. For example, if the input is
 * 'Google' and the offset is 3, the service will match on 'Goo'. The string
 * determined by the offset is matched against the first word in the input term
 * only. For example, if the input term is 'Google abc' and the offset is 3,
 * the service will attempt to match against 'Goo abc'. If no offset is
 * supplied, the service will use the whole term. The offset should generally
 * be set to the position of the text caret.
 */
export async function search(input: string, offset: number) {
  await index.search(applyOffset(input, offset), {
    suggest: true,
  });
}
