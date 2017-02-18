// @flow

import React, { Component } from 'react';
import { Text, Navigator, TouchableHighlight, AppRegistry, ToolbarAndroid, StyleSheet, ListView, View, TextInput, BackAndroid, StatusBar } from 'react-native';
import ActionButton from 'react-native-action-button';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import FontIcon from 'react-native-vector-icons/FontAwesome';

var _navigator;

export default class NotesApp extends Component {
  constructor() {
    super();
    this.state = {
      items: [
        { id: 1, title: 'hello', folder: true },
        { id: 2, title: 'world', content: 'hello' }
      ]
    };

    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.saveNote();
      if (_navigator.getCurrentRoutes().length === 1  ) {
         return false;
      }
      _navigator.pop();
      return true;
    });
  }

  render () {
    return (
      <View style={{flex: 1}}>
        <StatusBar
          backgroundColor='#25796A'
          barStyle='light-content'
        />
        <Navigator
          style={styles.container}
          tintColor='#2E9586'
          initialRoute={{id: 'ListNotes'}}
          renderScene={this.navigatorRenderScene}
        />
      </View>
    );
  }

  navigatorRenderScene = (route, navigator) => {
    _navigator = navigator;
    switch (route.id) {
      case 'ListNotes':
        return (
          <ListNotes
            navigator={navigator}
            items={this.state.items}
            addNote={this.addNote}
            addFolder={this.addFolder}
          />
        );
      case 'EditNote':
        return (
          <EditNote
            navigator={navigator}
            note={route.note}
            updateNote={this.updateNote}
            saveNote={this.saveNote}
          />
        );
    }
  }

  addNote = () => {
    this.onDataArrived({id: 3, title: 'new note', content: ''});
  }

  addFolder = () => {
    this.onDataArrived({id: 4, title: 'new folder', folder: true})
  }

  saveNote = () => {
    if (this.dirtyNote) {
      const note = this.dirtyNote;
      this.dirtyNote = null;
      const items = [...this.state.items];
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].id === note.id) {
          items[i] = note;
          break;
        }
      }
      this.setState({ items });
    }
  }

  updateNote = (note) => {
    this.dirtyNote = note;
  }

  onDataArrived(newData) {
    this.setState({
      items: this.state.items.concat(newData)
    });
  }
}

class ListNotes extends Component {
  constructor() {
    super();
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
  }

  onActionSelected = (idx) => {
    if (idx === 0) {
      this.props.addFolder();
    }
  }

  render() {
    const { items, addNote } = this.props;

    return (
      <View style={{flex:1}}>
        <MaterialIcon.ToolbarAndroid
          style={styles.toolbar}
          title={'Notes'}
          titleColor="white"
          actions={[
            // { title: 'Settings', iconName: 'settings', show: 'always' },
            { title: 'Create New Folder', iconName: 'create-new-folder', show: 'always' },
            { title: 'Menu', iconName: 'more-vert', show: 'always' },
          ]}
          onActionSelected={this.onActionSelected}
        />
        <ListView
          dataSource={this.ds.cloneWithRows(items)}
          renderRow={(rowData) => this.renderListViewRow(rowData)} />
          <ActionButton buttonColor="rgba(231,76,60,1)" onPress={addNote} >
            {/*
            <ActionButton.Item buttonColor='#9b59b6' title="New Task" onPress={() => console.log("notes tapped!")}>
              <Icon name="md-create" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item buttonColor='#3498db' title="Notifications" onPress={() => {}}>
              <Icon name="md-notifications-off" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => {}}>
              <Icon name="md-done-all" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            */}
          </ActionButton>
      </View>
    );
  }

  renderListViewRow(row) {
    const icon = row.folder
      ? <FontIcon name={'folder'} style={styles.rowCount} />
      : <FontIcon name={'file-text-o'} style={styles.rowIcon} />;

    return(
        <TouchableHighlight underlayColor={'#f3f3f2'}
                            onPress={() => this.selectRow(row)}>
          <View style={styles.rowContainer}>
              {icon}
              <View style={styles.rowDetailsContainer}>
                  <Text style={styles.rowTitle}>
                      {row.title}
                  </Text>
                  <Text style={styles.rowDetailsLine}>
                      Detail
                  </Text>
                  <View style={styles.separator}/>
              </View>
          </View>
        </TouchableHighlight>
    );
  }

  selectRow(row) {
    this.props.navigator.push({
      id: 'EditNote',
      note: row,
    });
  }
}

class EditNote extends Component {
  constructor(props) {
    super(props);
    this.state = { text: props.note.content };
  }

  render() {
    const { note, navigator, saveNote } = this.props;

    return (
      <View style={{flex: 1}}>
          <MaterialIcon.ToolbarAndroid
            style={styles.toolbar}
            title={note.title}
            titleColor="white"
            navIconName="keyboard-arrow-left"
            onIconClicked={this.saveNoteAndBack}
            actions={[
              // { title: 'Settings', iconName: 'md-settings', iconSize: 30, show: 'always' },
              { title: 'Menu', iconName: 'more-vert', show: 'always' },
            ]}
            /*overflowIconName="md-more"*/
          />
          <TextInput
            style={{flex: 1, borderColor: 'gray', borderWidth: 1}}
            multiline={true}
            textAlignVertical='top'
            underlineColorAndroid='transparent'
            onChangeText={this.updateNote}
            onBlur={saveNote}
            onEndEditing={saveNote}
            value={this.state.text}
          />
        </View>
    );
  }

  updateNote = (text) => {
    const { note, updateNote } = this.props;
    updateNote({...note, content: text});
    this.setState({ text });
  }

  saveNoteAndBack = () => {
    const { navigator, saveNote } = this.props;
    saveNote();
    navigator.pop();
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
    rowCount: {
        fontSize: 20,
        textAlign: 'right',
        color: 'gray',
        margin: 10,
        marginLeft: 15,
    },
    rowIcon: {
        fontSize: 15,
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
        marginTop: 10,
        marginBottom: 4,
        marginRight: 10,
        color: '#000000'
    },
    rowDetailsLine: {
        fontSize: 12,
        marginBottom: 10,
        color: 'gray',
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC'
    },
    actionButtonIcon: {
      fontSize: 20,
      height: 22,
      color: 'white',
    },
});

AppRegistry.registerComponent('NotesApp', () => NotesApp);
