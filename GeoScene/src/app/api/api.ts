const headers = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'GeoScene/app',
});

export const fetchJson = async (url: string) => {
  const response = await fetch(url, { method: 'GET', headers });
  const json = await response.json();
  return json;
};
