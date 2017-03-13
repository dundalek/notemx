// Based on https://github.com/instea/react-native-popup-menu/blob/master/src/renderers/ContextMenu.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

// Padding is 8 by material design
export const computePosition = ({ windowLayout, triggerLayout, optionsLayout }) => {
  return { top: 8, left: windowLayout.width - optionsLayout.width - 6 };
};

export default class ContextMenu extends React.Component {
  render() {
    const { style, children, layouts, ...other } = this.props;
    const position = computePosition(layouts);
    return (
      <View {...other} style={[styles.options, style, position]}>
        {children}
      </View>
    );
  }
}

// public exports
ContextMenu.computePosition = computePosition;

export const styles = StyleSheet.create({
  options: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'white',
    width: 200,

    // Shadow only works on iOS.
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 4,

    // This will elevate the view on Android, causing shadow to be drawn.
    elevation: 5,
  },
});
