// @flow

import React, { Component } from 'react';
import { View, TextInput, ListView, RefreshControl, TouchableHighlight, Text } from 'react-native';
import ActionButton from 'react-native-action-button';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import FontIcon from 'react-native-vector-icons/FontAwesome';
import Prompt from 'react-native-prompt';

export default class NoteList extends Component {
  ds: ListView.DataSource;

  constructor(props: Object) {
    super(props);
    this.state = {
      promptVisible: false
    };
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
  }

  render() {
    const { addNote, path, onRefresh, items, isRefreshing, styles } = this.props;
    const toolbarIcon = path ? 'keyboard-arrow-left' : null;
    const parts = path.split('/');
    const title = parts[parts.length-1] || 'NotesApp';

    return (
      <View style={{flex:1}}>
        <MaterialIcon.ToolbarAndroid
          style={styles.toolbar}
          title={title}
          titleColor="white"
          navIconName={toolbarIcon}
          onIconClicked={this.onToolbarIconClicked}
          actions={[
            // { title: 'Settings', iconName: 'settings', show: 'always' },
            { title: 'Create New Folder', iconName: 'create-new-folder', show: 'always' },
            { title: 'Menu', iconName: 'more-vert', show: 'always' },
          ]}
          onActionSelected={this.onActionSelected}
        />
        {items && (items.length > 0 || isRefreshing)
          ? <ListView
            dataSource={this.ds.cloneWithRows(items)}
            renderRow={(rowData) => this.renderListViewRow(rowData)}
            enableEmptySections={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                title="Loading..."
                titleColor="#000000"
                colors={['#ffffff']}
                progressBackgroundColor='#2E9586'
              />
            }
          />
          : <Text style={styles.emptyFolderText}>{items ? 'Empty Folder!' : 'Loading files...'}</Text>
        }
        <Prompt
          title="Create new folder"
          placeholder="New Folder"
          defaultValue=""
          visible={this.state.promptVisible}
          onCancel={() => this.setState({ promptVisible: false })}
          onSubmit={this.onPromptSubmit}
        />
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

  renderListViewRow(row: Object) {
    const { styles } = this.props;
    const icon = row.folder
      ? <FontIcon name={'folder'} style={styles.rowIcon} />
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
                  <View style={styles.separator}/>
              </View>
          </View>
        </TouchableHighlight>
    );
  }

  selectRow(row: Object) {
    if (row.folder) {
      this.props.navigator.push({
        id: 'NoteList',
        path: row.path_display,
      });
    } else {
      this.props.editNote(row.path_display);
    }
  }

  onActionSelected = (idx: string) => {
    if (idx === 0) {
      // create folder
      this.setState({ promptVisible: true });
    }
  }

  onPromptSubmit = (value) => {
    this.setState({
      promptVisible: false
    });
    this.props.addFolder(this.props.path + '/' + value.trim());
  }

  onToolbarIconClicked = () => {
    this.props.navigator.pop();
  }
}
