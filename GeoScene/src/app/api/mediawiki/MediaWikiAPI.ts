import { fetchJson } from './../api';

const API_ADDRESS = 'https://en.wikipedia.org/w/api.php?action=query';
const HEB_API_ADDRESS = 'https://he.wikipedia.org/w/api.php?action=query';

const GOOGLE_SEARCH = 'https://www.google.com/search?q=';

export interface PageHeaderContentType {
  page_id: number;
  content: string;
}

const heMultiExtract = 'האם התכוונתם ל';
const enMultiExtract = 'Did you mean';

export const getPageHeaderContent = async (
  name: string | undefined,
  is_heb?: boolean,
): Promise<PageHeaderContentType | undefined> => {
  if (name) {
    try {
      const json = await fetchJson(
        (is_heb ? HEB_API_ADDRESS : API_ADDRESS) +
          `&prop=extracts&exintro&titles=${name}&exintro=&exsentences=3&explaintext=&redirects=&formatversion=2&format=json`,
      );
      const extract = json.query.pages[0].extract;
      return {
        page_id: json.query.pages[0].pageid,
        content:
          (is_heb && extract.startsWith(heMultiExtract)) ||
          (!is_heb && extract.startsWith(enMultiExtract))
            ? undefined
            : extract,
      };
    } catch (ex) {
      return undefined;
    }
  }
  return undefined;
};

export const getPageThumbnail = async (
  pageid: number,
  is_heb: boolean,
): Promise<string | undefined> => {
  try {
    const json = await fetchJson(
      (is_heb ? HEB_API_ADDRESS : API_ADDRESS) +
        `&formatversion=2&prop=pageimages&pageids=${pageid}&format=json&pithumbsize=300`,
    );
    return json.query.pages[0].thumbnail.source;
  } catch (ex) {
    return undefined;
  }
};

export const getPageURL = async (
  pageId: number,
  is_heb?: boolean,
): Promise<string | undefined> => {
  try {
    const json = await fetchJson(
      (is_heb ? HEB_API_ADDRESS : API_ADDRESS) +
        `&prop=info&pageids=${pageId}&inprop=url&format=json`,
    );
    return json.query.pages[pageId].fullurl;
  } catch (ex) {
    return undefined;
  }
};

export const getGoogleSearchURL = (
  term: string | undefined,
): string | undefined => {
  return term && GOOGLE_SEARCH + term;
};
