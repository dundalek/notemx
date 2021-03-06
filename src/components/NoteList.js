// @flow

import React, { Component } from 'react';
import { View, TextInput, ListView, RefreshControl, TouchableHighlight, Text, TouchableOpacity } from 'react-native';
import ActionButton from 'react-native-action-button';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import FontIcon from 'react-native-vector-icons/FontAwesome';
import Prompt from 'react-native-prompt';
import Menu, { MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import SearchBar from 'react-native-material-design-searchbar';
import CustomMenu from '../util/CustomMenu';

const renderTouchable = () => <TouchableOpacity/>;

export default class NoteList extends Component {
  ds: ListView.DataSource;
  state: {
    promptVisible: boolean;
  };
  menuName: string;

  constructor(props: Object) {
    super(props);
    this.menuName = 'NoteListMenu';
    this.state = {
      promptVisible: false
    };
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
  }

  render() {
    const { addNote, path, onRefresh, items, isRefreshing, styles, isSearching, message } = this.props;
    const toolbarIcon = (path || isSearching) ? 'keyboard-arrow-left' : null;
    let title = '';
    if (path) {
      const parts = path.split('/');
      title = parts[parts.length-1];
    } else if (isSearching) {
      title = 'Search Notes';
    }
    title = title  || 'NoteMX';

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
            // { title: 'Create New Folder', iconName: 'create-new-folder', show: 'always' },
            { title: 'Search', iconName: 'search', show: 'always' },
            { title: 'Menu', iconName: 'more-vert', show: 'always' },
          ]}
          onActionSelected={this.onActionSelected}
        />
        {isSearching && <SearchBar
          onSearchChange={this.onSearchChange}
          height={50}
          // onFocus={() => console.log('On Focus')}
          // onBlur={() => console.log('On Blur')}
          placeholder={'Search...'}
          autoCorrect={false}
          padding={5}
          returnKeyType={'search'}
          inputProps={{
            autoFocus: true
          }}
        />}
        <Menu onSelect={this.onMenuSelected} name={this.menuName} renderer={CustomMenu}>
          <MenuTrigger disabled={true} />
          <MenuOptions>
            <MenuOption value={'create_folder'} renderTouchable={renderTouchable} style={styles.menuOption}>
              <Text style={styles.menuOptionText}>Create New Folder</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
        {message}
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

  onMenuSelected = (value: string) => {
    if (value === 'create_folder') {
      this.setState({ promptVisible: true });
    }
  }

  onActionSelected = (idx: number) => {
    if (idx === 0) {
      this.props.onSearchToggle();
    } else if (idx === 1) {
      this.props.openMenu(this.menuName);
    }
  }

  onPromptSubmit = (value: string) => {
    this.setState({
      promptVisible: false
    });
    this.props.addFolder(this.props.path + '/' + value.trim());
  }

  onToolbarIconClicked = () => {
    this.props.navigator.pop();
  }

  onSearchChange = (text: string) => {
    this.props.onSearchChange(text);
  }
}
