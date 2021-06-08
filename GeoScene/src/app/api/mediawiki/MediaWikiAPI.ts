import { fetchJson } from './../api';

const API_ADDRESS = 'https://en.wikipedia.org/w/api.php?action=query';
const HEB_API_ADDRESS = 'https://he.wikipedia.org/w/api.php?action=query';

const GOOGLE_SEARCH = 'https://www.google.com/search?q=';

export interface PageHeaderContentType {
  page_id: number;
  content: string;
}

export const getPageHeaderContent = async (
  name: string,
  is_heb?: boolean,
): Promise<PageHeaderContentType | undefined> => {
  try {
    const json = await fetchJson(
      (is_heb ? HEB_API_ADDRESS : API_ADDRESS) +
        `&prop=extracts&exintro&titles=${name}&exintro=&exsentences=3&explaintext=&redirects=&formatversion=2&format=json`,
    );
    return {
      page_id: json.query.pages[0].pageid,
      content: json.query.pages[0].extract,
    };
  } catch (ex) {
    return undefined;
  }
};

export const getPageThumbnail = async (
  name: string,
  is_heb?: boolean,
): Promise<string | undefined> => {
  try {
    const json = await fetchJson(
      (is_heb ? HEB_API_ADDRESS : API_ADDRESS) +
        `&formatversion=2&prop=pageimages&titles=${name}&format=json&pithumbsize=300`,
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
