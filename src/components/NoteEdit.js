// @flow

import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Menu, { MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const renderTouchable = () => <TouchableOpacity/>;

export default class NoteEdit extends Component {
  state: {
    title: string;
    text: string;
  }
  menuName: string;

  constructor(props: Object) {
    super(props);
    this.menuName = 'EditNoteMenu';
    this.state = {
      title: props.note.title,
      text: props.note.content
    };
  }

  componentWillReceiveProps(nextProps: Object) {
    this.setState({
      title: nextProps.note.title,
      text: nextProps.note.content
    })
  }

  componentDidMount() {
    if (!this.state.title) {
      this.refs.titleInput.focus();
    }
  }

  render() {
    const { note, navigator, saveNote, styles } = this.props;

    return (
      <View style={{flex: 1}}>
          <MaterialIcon.ToolbarAndroid
            style={styles.toolbar}
            title='Notes'
            titleColor="white"
            navIconName="keyboard-arrow-left"
            onIconClicked={this.saveNoteAndBack}
            actions={[
              // { title: 'Settings', iconName: 'md-settings', iconSize: 30, show: 'always' },
              { title: 'Menu', iconName: 'more-vert', show: 'always' },
            ]}
            onActionSelected={this.onActionSelected}
            /*overflowIconName="md-more"*/
          />
          <Menu onSelect={this.onMenuSelected} name={this.menuName}>
            <MenuTrigger disabled={true} />
            <MenuOptions>
              <MenuOption value={'delete'} renderTouchable={renderTouchable}>
                <Text>Delete</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
          <TextInput
            ref="titleInput"
            style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 5}}
            underlineColorAndroid='transparent'
            value={this.state.title}
            returnKeyType='next'
            onChangeText={this.updateNoteTitle}
            onSubmitEditing={this.onTitleSubmitted}
          />
          <TextInput
            ref="noteInput"
            style={{flex: 1, padding: 20, paddingTop: 0}}
            multiline={true}
            textAlignVertical='top'
            underlineColorAndroid='transparent'
            onChangeText={this.updateNoteContent}
            onBlur={saveNote}
            onEndEditing={saveNote}
            value={this.state.text}
          />
        </View>
    );
  }

  onActionSelected = () => {
    this.props.openMenu(this.menuName);
  }

  onMenuSelected = (value: string) => {
    const { note, deleteNote, navigator } = this.props;
    deleteNote(note);
    navigator.pop();
  }

  onTitleSubmitted = () => {
    this.refs.noteInput.focus();
  }

  updateNoteTitle = (title: string) => {
    const { note, updateNote } = this.props;
    updateNote({ note, title });
    this.setState({ title });
  }

  updateNoteContent = (text: string) => {
    const { note, updateNote } = this.props;
    updateNote({ note, content: text});
    this.setState({ text });
  }

  saveNoteAndBack = () => {
    const { navigator, saveNote } = this.props;
    saveNote();
    navigator.pop();
  }
}
