// @flow

import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Menu, { MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import CustomMenu from '../util/CustomMenu';

const renderTouchable = () => <TouchableOpacity/>;

type Selection = { start: number, end: number };

export default class NoteEdit extends Component {
  state: {
    title: string;
    text: string;
    selection: ?Selection;
  }
  menuName: string;
  selection: ?Selection;

  constructor(props: Object) {
    super(props);
    this.menuName = 'EditNoteMenu';
    this.state = {
      ...this.getStateFromProps(props),
      selection: null
    };
  }

  componentWillReceiveProps(nextProps: Object) {
    this.setState(this.getStateFromProps(nextProps));
  }

  getStateFromProps(props: Object) {
    return {
      title: props.note ? props.note.title : '',
      text: props.note ? props.note.content : '',
    };
  }

  componentDidMount() {
    if (!this.props.isLoading && !this.state.title) {
      this.refs.titleInput.focus();
    }
  }

  render() {
    const { note, navigator, saveNote, styles, isLoading } = this.props;
    const { text, title, selection } = this.state;

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
          <Menu onSelect={this.onMenuSelected} name={this.menuName} renderer={CustomMenu}>
            <MenuTrigger disabled={true} />
            <MenuOptions>
              <MenuOption value={'delete'} renderTouchable={renderTouchable}>
                <Text>Delete</Text>
              </MenuOption>
              <MenuOption value={'share'} renderTouchable={renderTouchable}>
                <Text>Share</Text>
              </MenuOption>
              <MenuOption value={'insert-date'} renderTouchable={renderTouchable}>
                <Text>Insert current date</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
          <TextInput
            ref="titleInput"
            style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 5}}
            underlineColorAndroid='transparent'
            value={title}
            returnKeyType='next'
            onChangeText={this.updateNoteTitle}
            onSubmitEditing={this.onTitleSubmitted}
            editable={!isLoading}
          />
          <TextInput
            ref="noteInput"
            style={{flex: 1, padding: 20, paddingTop: 0}}
            multiline={true}
            textAlignVertical='top'
            underlineColorAndroid='transparent'
            onChangeText={this.updateNoteContent}
            selection={selection}
            // we handle back button and app state change so these should no be necessary to catch changes
            // onBlur={saveNote}
            // onEndEditing={saveNote}
            value={text}
            editable={!isLoading}
            onSelectionChange={this.onSelectionChange}
          />
        </View>
    );
  }

  onActionSelected = () => {
    this.props.openMenu(this.menuName);
  }

  onMenuSelected = (value: string) => {
    const { note, deleteNote, shareNote, navigator } = this.props;
    switch (value) {
      case 'delete':
        deleteNote(note);
        navigator.pop();
        break;
      case 'share':
        shareNote({
          title: this.state.title,
          content: this.state.text,
        });
        break;
      case 'insert-date': {
        const d = new Date();
        const insertedText = `${d.getDate()}.${d.getMonth()+1}.`;
        this.insertText(insertedText);
        break;
      }
    }
  }

  onTitleSubmitted = () => {
    this.refs.noteInput.focus();
  }

  updateNoteTitle = (title: string) => {
    const { note, updateNote } = this.props;
    if (title !== this.state.title) {
      updateNote({ note, title });
      this.setState({ title });
    }
  }

  updateNoteContent = (text: string) => {
    const { note, updateNote } = this.props;
    if (text !== this.state.text) {
      updateNote({ note, content: text});
      this.setState({ text });
    }
  }

  saveNoteAndBack = () => {
    const { navigator, saveNote } = this.props;
    saveNote();
    navigator.pop();
  }

  onSelectionChange = ({ nativeEvent }: { nativeEvent: { selection: Selection } }) => {
    this.selection = nativeEvent.selection;
    if (this.state.selection) {
      this.setState({
        selection: null
      });
    }
  }

  insertText = (insertedText: string) => {
    const { note, updateNote } = this.props;
    let { text } = this.state;
    let { selection } = this;
    let newText;
    if (selection) {
      newText = text.slice(0, selection.start) + insertedText + text.slice(selection.end);
    } else {
      newText = text + insertedText;
    }
    updateNote({ note, content: newText});
    if (selection) {
      selection = {
        start: selection.start + insertedText.length,
        end: selection.start + insertedText.length // start intentional
      };
    }
    this.setState({ text: newText, selection });
  }
}
