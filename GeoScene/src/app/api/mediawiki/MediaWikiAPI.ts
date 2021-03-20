import { fetchJson } from './../api';

const API_ADDRESS = 'https://en.wikipedia.org/w/api.php?action=query';

export interface PageHeaderContentType {
  page_id: number;
  content: string;
}

export const getPageHeaderContent = async (
  name: string,
): Promise<PageHeaderContentType | undefined> => {
  try {
    const json = await fetchJson(
      API_ADDRESS +
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
): Promise<string | undefined> => {
  try {
    const json = await fetchJson(
      API_ADDRESS +
        `&formatversion=2&prop=pageimages&titles=${name}&format=json&pithumbsize=300`,
    );
    return json.query.pages[0].thumbnail.source;
  } catch (ex) {
    return undefined;
  }
};

export const getPageURL = async (
  pageId: number,
): Promise<string | undefined> => {
  try {
    const json = await fetchJson(
      API_ADDRESS + `&prop=info&pageids=${pageId}&inprop=url&format=json`,
    );
    console.log(json);
    return json.query.pages[pageId].fullurl;
  } catch (ex) {
    return undefined;
  }
};
