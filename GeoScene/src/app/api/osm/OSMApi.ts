import { authManager } from '../../auth/Authentication';

const builder = require('xmlbuilder');
const xmlBuilder = builder.create('osm', { encoding: 'utf-8' });

export const getPermissions = async () => {
  const details = await authManager.makeRequest('osm', 'api/0.6/permissions', false, 
  {
    method: 'GET',
  });
  return details;
};

// export const user = async () => {
//    const details = await authManager.makeRequest('osm', 'api/0.6/permissions', {
//      method: 'GET',
//    });
//    return details;
//  };

export const addNewLocation = async (lat, lon, name, description) => {
  const csID = await createChangeset();
  const nodeID = await createNode(csID, lat, lon, name, description);
  console.log(nodeID);
};

export const createChangeset = async () => {
  //   const perm = await getPermissions();
  const xml = xmlBuilder
    .ele('changeset')
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .up()
    .ele('tag', { k: 'comment', v: 'adding new node' })
    .end({ pretty: true, allowEmpty: false });
  //   console.log(perm.data.osm.permissions);
  const id = await authManager.makeRequest(
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

  return id;
};


export const createNode = async (csID:string, lat:string, lon:string, name:string, description) => {
  const xml = xmlBuilder
    .ele('node', { k: 'cangeset', v: csID }, { k: 'lat', v: lat }, { k: 'lon', v: lon } )
    .ele('tag', { k: 'name', v: name })
    .up()
    .ele('tag', { k: 'description', v: description })
    .end({ pretty: true, allowEmpty: false });
  const id = await authManager.makeRequest(
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
  return id;
};
