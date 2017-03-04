// @flow

import RNFetchBlob from 'react-native-fetch-blob';
import config from '../config.json';

// Because dropbox sdk does not work in RN
// https://github.com/dropbox/dropbox-sdk-js/issues/62
export function makeDropboxDownloadRequest(params: Object) {
  const url = 'https://content.dropboxapi.com/2/files/download';
  const args = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + config.accessToken,
      'Dropbox-API-Arg': JSON.stringify(params)
    },
  };
  var data = {};

  return fetch(url, args)
    .then(res => {
      data = JSON.parse(res.headers.get('dropbox-api-result'));
      return res.text();
    })
    .then(body => {
      data.fileBinary = body;
      return data;
    })
}

export function makeDropboxUploadRequest(params: Object, body: string) {
  const url = 'https://content.dropboxapi.com/2/files/upload';
  const headers = {
    'Content-Type': 'text/plain; charset=dropbox-cors-hack',
    'Authorization': 'Bearer ' + config.accessToken,
    'Dropbox-API-Arg': JSON.stringify(params)
  };

  return RNFetchBlob.fetch('POST', url, headers, body)
    .then(res => {
      return res.json();
    });
}

export function makeDropboxRequest(endpoint: string, params: Object) {
  const url = 'https://api.dropboxapi.com/2/' + endpoint;
  const args = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + config.accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  };

  return fetch(url, args)
    .then(res => {
      return res.json();
    });
}
