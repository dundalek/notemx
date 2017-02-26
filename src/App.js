// @flow

import React, { Component } from 'react';
import { Text, Navigator, TouchableHighlight, AppRegistry, ToolbarAndroid, StyleSheet, ListView, View, TextInput, BackAndroid, StatusBar, TouchableOpacity, RefreshControl, AppState } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob'
import { MenuContext } from 'react-native-menu';
import CustomTransitions from './util/CustomTransitions';
import NoteList from './components/NoteList';
import NoteEdit from './components/NoteEdit';

import Dropbox from 'dropbox';
import config from '../config.json';
const dbx = new Dropbox(config);

function loaderWrapper(startFn, endFn, delay=500) {
  let started = false;
  const timeout = setTimeout(() => {
    started = true;
    startFn();
  }, delay);

  return () => {
    if (started) {
      endFn();
    } else {
      clearTimeout(timeout);
    }
  };
}

var _navigator;

// Because dropbox sdk does not work in RN
// https://github.com/dropbox/dropbox-sdk-js/issues/62
function makeDropboxDownloadRequest(params) {
  const url = 'https://content.dropboxapi.com/2/files/download';
  const args = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + config.accessToken,
      'Dropbox-API-Arg': JSON.stringify(params)
    },
  };
  var data;

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

function makeDropboxUploadRequest(params, body) {
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

type Route = Object;
type Path = string;
type Note = Object;

export default class App extends Component {
  state: {
      items: Array<Object>;
      isRefreshing: number;
      path: string;
  };
  menuContext: Object;
  folderCache: Object;
  dirtyNote: Note | null;

  constructor() {
    super();

    this.state = {
      items: [],
      isRefreshing: 0,
      path: '',
    };
    this.dirtyNote = null;
    this.folderCache = {};
    this.listFolder(this.state.path);

    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.saveNote();
      if (this.menuContext.isMenuOpen()) {
        this.menuContext.closeMenu();
      }
      if (_navigator.getCurrentRoutes().length === 1  ) {
         return false;
      }
      _navigator.pop();
      return true;
    });
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  render () {
    return (
      <MenuContext style={{flex: 1}} ref={(el) => this.menuContext = el}>
        <StatusBar
          backgroundColor='#25796A'
          barStyle='light-content'
        />
        <Navigator
          style={styles.container}
          tintColor='#2E9586'
          initialRoute={{id: 'NoteList', path: ''}}
          renderScene={this.navigatorRenderScene}
          configureScene={(route, routeStack) =>
            // Navigator.SceneConfigs.PushFromRight
            CustomTransitions.NONE
          }
          onWillFocus={this.onWillFocus}
        />
      </MenuContext>
    );
  }

  navigatorRenderScene = (route: Route, navigator: Navigator) => {
    _navigator = navigator;
    switch (route.id) {
      case 'NoteList':
        return (
          <NoteList
            navigator={navigator}
            path={route.path}
            addNote={this.addNote}
            addFolder={this.addFolder}
            editNote={this.editNote}
            onRefresh={this.onRefresh}
            isRefreshing={this.state.isRefreshing > 0}
            items={this.state.items}
            styles={styles}
          />
        );
      case 'NoteEdit':
        return (
          <NoteEdit
            navigator={navigator}
            note={route.note}
            updateNote={this.updateNote}
            saveNote={this.saveNote}
            deleteNote={this.deleteNote}
            openMenu={this.openMenu}
            styles={styles}
          />
        );
    }
  }

  onWillFocus = (route: Route) => {
    if (route.id === 'NoteList') {
      this.setState({
        path: route.path,
        items: this.folderCache[route.path] || this.state.items
      });
      this.listFolder(route.path);
    }
  }

  handleAppStateChange = (currentAppState) => {
    const currentRoute = _navigator.getCurrentRoutes().slice(-1)[0];
    if (currentRoute && currentRoute.id === 'NoteList' && currentAppState === 'active') {
      this.listFolder(this.state.path);
    }
    if (currentRoute && currentRoute.id === 'NoteEdit' && currentAppState === 'active') {
      // TODO refresh note content if not changed
    }
    if (currentRoute && currentRoute.id === 'NoteEdit' && (currentAppState === 'inactive' || currentAppState === 'background')) {
      this.saveNote();
      //TODO update content in note edit and revision
    }
  }

  addNote = () => {
    const note = {id: 3, title: '', content: ''};
    this.onDataArrived(note);
    _navigator.push({
      id: 'NoteEdit',
      note,
    });
  }

  addFolder = (path) => {
    dbx
      .filesCreateFolder({ path })
      .then(() =>  this.listFolder(this.state.path))
      .catch(e => console.error(e))
      .then(this.loaderWrapper());
  }

  saveNote = () => {
    const note = this.dirtyNote;
    if (note) {
      makeDropboxUploadRequest({
         path: note.path_lower,
         mode: {
           ".tag": "update",
           "update": note.rev
         }, // overwrite only if rev matches
         autorename: true,
      }, note.content)
        .then(x => console.log('note saved', x))
        .catch(e => console.error(e))
        .then(this.loaderWrapper())
      this.dirtyNote = null;
    }
  }

  updateNote = (note: Note) => {
    this.dirtyNote = note;
  }

  deleteNote = (id: string) => {
    this.setState({
      items: this.state.items.filter(n => n.id !== id)
    });
  }

  editNote = (path: Path) => {
    makeDropboxDownloadRequest({ path })
      .then((item) => {
        _navigator.push({
          id: 'NoteEdit',
          note: {
            id: item.id,
            title: item.name,
            path_lower: item.path_lower,
            rev: item.rev,
            content: item.fileBinary,
          },
        });
      })
      .catch((error) => {
        console.error(error);
      })
      .then(this.loaderWrapper());
  }

  onDataArrived(newData: Note) {
    this.setState({
      items: this.state.items.concat(newData)
    });
  }

  openMenu = (name: string) => {
    this.menuContext.openMenu(name);
  }

  onRefresh = () => {
    this.listFolder(this.state.path);
  }

  listFolder = (path: Path) => {
    dbx.filesListFolder({ path })
      .then((response) => {
        const items = response.entries.map(item => ({
          id: item.id,
          folder: item['.tag'] === 'folder',
          title: item.name,
          path_lower: item.path_lower,
          rev: item.rev
        }));

        this.folderCache[path] = items;
        this.setState({ items });
      })
      .catch((error) => {
        console.error(error);
      })
      .then(this.loaderWrapper());
  }

  loaderWrapper(delay=500) {
    return loaderWrapper(
      () => this.setState({ isRefreshing: this.state.isRefreshing + 1 }),
      () => this.setState({ isRefreshing: this.state.isRefreshing - 1 }),
      delay
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    toolbar: {
      height: 56,
      backgroundColor: '#2E9586'
    },
    rowContainer:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        fontSize: 20,
        textAlign: 'right',
        color: 'gray',
        margin: 10,
        marginLeft: 15,
    },
    rowDetailsContainer: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 15,
        textAlign: 'left',
        marginTop: 15,
        marginBottom: 15,
        marginRight: 10,
        color: '#000000'
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC'
    },
    emptyFolderText: {
      flex: 1,
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 20
    },
    actionButtonIcon: {
      fontSize: 20,
      height: 22,
      color: 'white',
    },
});
