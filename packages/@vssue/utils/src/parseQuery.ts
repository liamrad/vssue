import { parse } from 'qs'

export const parseQuery = (URL: string): Record<string, string> =>
  parse(URL, { ignoreQueryPrefix: true }) as Record<string, string>
