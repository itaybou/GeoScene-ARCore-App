import { authManager } from '../../auth/Authentication';

const builder = require('xmlbuilder');

export const getPermissions = async () => {
  const details = await authManager.makeRequest('osm', 'api/0.6/permissions', {
    method: 'GET',
  });
  return details;
};

const osmXMLRoot = () => {
  return builder.create('osm', { encoding: 'utf-8' });
};

export const addNewLocation = async (
  lat: string,
  lon: string,
  name: string,
  description: string,
) => {
  const csID = await createChangeset();
  const nodeID = await createNode(csID, lat, lon, name, description);
};

export const deleteLocation = async (
  nodeID: string,
  version: string,
  lat: string,
  lon: string,
) => {
  const csID = await createChangeset();
  const newVersion = await deleteNode(csID, nodeID, version, lat, lon);
};

export const updateLocation = async (
  nodeID: string,
  version: string,
  lat: string,
  lon: string,
  name: string,
  description: string,
) => {
  const csID = await createChangeset();
  const newVersion = await updateNode(
    csID,
    nodeID,
    version,
    lat,
    lon,
    name,
    description,
  );
};

const parseServerResponse = (response) => {
  console.log(response);
  return response.status === 400 || response.status === 500
    ? null
    : response.data;
};

export const createChangeset = async () => {
  //   const perm = await getPermissions();
  const xml = osmXMLRoot()
    .ele('changeset')
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .up()
    .ele('tag', { k: 'comment', v: 'adding new node' })
    .end({ pretty: true, allowEmpty: false });
  //console.log(xml);
  try {
    const response = await authManager.makeRequest(
      'osm',
      'api/0.6/changeset/create',
      true,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'text/xml' },
        params: {
          body: xml,
        },
      },
    );
    console.log(response);
    return parseServerResponse(response);
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

export const createNode = async (
  csID: string,
  lat: string,
  lon: string,
  name: string,
  description: string,
) => {
  const xml = osmXMLRoot()
    .ele('node', { changeset: csID, lat: lat, lon: lon })
    .ele('tag', { k: 'name', v: name })
    .up()
    .ele('tag', { k: 'description', v: description })
    .up()
    .ele('tag', { k: 'timestamp', v: Math.floor(Date.now() / 1000) })
    .up()
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .end({ pretty: true, allowEmpty: false });

  console.log(xml);
  try {
    const response = await authManager.makeRequest(
      'osm',
      'api/0.6/node/create',
      true,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'text/xml' },
        params: {
          body: xml,
        },
      },
    );
    return parseServerResponse(response);
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

export const deleteNode = async (
  csID: string,
  nodeID: string,
  version: string,
  lat: string,
  lon: string,
) => {
  const xml = osmXMLRoot()
    .ele('node', {
      changeset: csID,
      id: nodeID,
      lat: lat,
      lon: lon,
      version: version,
    })
    .end({ pretty: true, allowEmpty: false });
  try {
    const response = await authManager.makeRequest(
      'osm',
      `api/0.6/node/#${nodeID}`,
      true,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'text/xml' },
        params: {
          body: xml,
        },
      },
    );
    console.log(response);
    return parseServerResponse(response);
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

export const updateNode = async (
  csID: string,
  nodeID: string,
  version: string,
  lat: string,
  lon: string,
  name: string,
  description: string,
) => {
  const xml = osmXMLRoot()
    .ele('node', {
      changeset: csID,
      id: nodeID,
      lat: lat,
      lon: lon,
      'version:': version,
      visible: true,
    })
    .ele('tag', { k: 'name', v: name })
    .up()
    .ele('tag', { k: 'description', v: description })
    .up()
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .end({ pretty: true, allowEmpty: false });

  try {
    const response = await authManager.makeRequest(
      'osm',
      `api/0.6/node/#${nodeID}`,
      true,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'text/xml' },
        params: {
          body: xml,
        },
      },
    );
    return parseServerResponse(response);
  } catch (ex) {
    return null;
  }
};
