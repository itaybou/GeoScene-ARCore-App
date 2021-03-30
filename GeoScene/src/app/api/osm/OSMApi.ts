import { authManager } from '../../auth/Authentication';

const builder = require('xmlbuilder');
const xmlBuilder = builder.create('osm', { encoding: 'utf-8' });

export const getPermissions = async () => {
  const details = await authManager.makeRequest('osm', 'api/0.6/permissions', {
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

export const createChangeset = async () => {
  //   const perm = await getPermissions();
  const xml = xmlBuilder
    .ele('changeset')
    .ele('tag', { k: 'created_by', v: 'GeoScene' })
    .up()
    .ele('tag', { k: 'comment', v: 'Just adding some streetnames' })
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
