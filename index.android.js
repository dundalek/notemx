// @flow

import React, { Component } from 'react';
import { Text, Navigator, TouchableHighlight, AppRegistry, ToolbarAndroid, StyleSheet, ListView, View, TextInput, BackAndroid } from 'react-native';

var _navigator;

BackAndroid.addEventListener('hardwareBackPress', () => {
  if (_navigator.getCurrentRoutes().length === 1  ) {
     return false;
  }
  _navigator.pop();
  return true;
});

export default class NotesApp extends Component {
  render () {
    return (
      <Navigator
        style={styles.container}
        tintColor='#2E9586'
        initialRoute={{id: 'ListNotes'}}
        renderScene={this.navigatorRenderScene}/>
    );
  }

  navigatorRenderScene (route, navigator){
    _navigator = navigator;
    switch (route.id) {
      case 'ListNotes':
        return (<ListNotes navigator={navigator} />);
      case 'EditNote':
        return (<EditNote navigator={navigator} note={route.note} />);
    }
  }
}

class ListNotes extends Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
    this.state = {
      // dataSource: ds.cloneWithRows(['row 1', 'row 2']),
      dataSource: ds.cloneWithRows([
        { id: 1, title: 'hello' },
        { id: 2, title: 'world' }
      ]),
    };
  }

  render() {
    return (
      <View style={{flex:1}}>
        <ToolbarAndroid style={styles.toolbar}
          title={'Notes'}
          titleColor={'#FFFFFF'} />
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => this.renderListViewRow(rowData)} />
      </View>
    );
  }

  renderListViewRow(row) {
    return(
        <TouchableHighlight underlayColor={'#f3f3f2'}
                            onPress={() => this.selectRow(row)}>
          <View style={styles.rowContainer}>
              <Text style={styles.rowCount}>
                  {row.id}
              </Text>
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
    this.state = { text: props.note.title };
  }

  render() {
    const { note, navigator } = this.props;

    return (
      <View style={{flex: 1}}>
        <ToolbarAndroid style={styles.toolbar}
          title={note.title}
          navIcon={{uri: "ic_arrow_back_white_24dp", isStatic: true}}
          onIconClicked={navigator.pop}
          titleColor={'#FFFFFF'}/>
          <TextInput
            style={{flex: 1, borderColor: 'gray', borderWidth: 1}}
            multiline={true}
            textAlignVertical='top'
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({text})}
            /*onBlur*/
            /*onEndEditing*/
            value={this.state.text}
          />
        </View>
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
    rowCount: {
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
    }
});

AppRegistry.registerComponent('NotesApp', () => NotesApp);
