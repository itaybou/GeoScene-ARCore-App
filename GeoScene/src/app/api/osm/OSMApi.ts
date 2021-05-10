import { authManager } from '../../auth/Authentication';

const builder = require('xmlbuilder');

// export const getPermissions = async () => {
//   const details = await authManager.makeRequest('osm', 'api/0.6/permissions', {
//     method: 'GET',
//   });
//   return details;
// };

const parseServerResponse = (response) => {
  return response.status !== 200 ? null : response.data;
};

const osmXMLRoot = () => {
  return builder.create('osm', { encoding: 'utf-8' });
};

export const addNewLocation = async (
  lat: number,
  lon: number,
  name: string,
  description: string,
) => {
  const csID = await createChangeset();
  if (!csID) return null;
  return await createNode(csID, lat, lon, name, description);
};

export const deleteLocation = async (
  nodeID: number,
  version: number,
  lat: number,
  lon: number,
) => {
  const csID = await createChangeset();
  if (!csID) return null;
  return await deleteNode(csID, nodeID, version, lat, lon);
};

export const updateLocation = async (
  nodeID: number,
  version: number,
  lat: number,
  lon: number,
  name: string,
  description: string,
) => {
  const csID = await createChangeset();
  if (!csID) return null;
  return await updateNode(csID, nodeID, version, lat, lon, name, description);
};

export const createChangeset = async () => {
  //   const perm = await getPermissions();
  const xml = osmXMLRoot()
    .ele('changeset')
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .up()
    .ele('tag', { k: 'comment', v: 'adding new node' })
    .end({ pretty: false, allowEmpty: false });
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

    return parseServerResponse(response);
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

export const createNode = async (
  csID: number,
  lat: number,
  lon: number,
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
    .end({ pretty: false, allowEmpty: false });

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
  csID: number,
  nodeID: number,
  version: number,
  lat: number,
  lon: number,
) => {
  const xml = osmXMLRoot()
    .ele('node', {
      id: nodeID,
      version,
      changeset: csID,
      lat,
      lon,
    })
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .up()
    .end({ pretty: false, allowEmpty: false });

  try {
    const response = await authManager.makeRequest(
      'osm',
      `api/0.6/node/${nodeID}`,
      true,
      {
        method: 'DELETE',
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

export const updateNode = async (
  csID: number,
  nodeID: number,
  version: number,
  lat: number,
  lon: number,
  name: string,
  description: string,
) => {
  console.log(nodeID);
  const xml = osmXMLRoot()
    .ele('node', {
      id: nodeID,
      changeset: csID,
      lat: lat,
      lon: lon,
      version,
      visible: true,
    })
    .ele('tag', { k: 'name', v: name })
    .up()
    .ele('tag', { k: 'description', v: description })
    .up()
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .end({ pretty: false, allowEmpty: false });

  console.log(xml);
  try {
    const response = await authManager.makeRequest(
      'osm',
      `api/0.6/node/${nodeID}`,
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
