// Based on https://github.com/instea/react-native-popup-menu/blob/master/src/renderers/ContextMenu.js
import React from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
const OPEN_ANIM_DURATION = 225
const CLOSE_ANIM_DURATION = 195;

export const computePosition = ({ windowLayout, triggerLayout, optionsLayout }) => {
  return { top: triggerLayout.y, left: windowLayout.width - optionsLayout.width };
};

export default class ContextMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      scaleAnim: new Animated.Value(0.1),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.scaleAnim, {
      duration: OPEN_ANIM_DURATION,
      toValue: 1,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  close() {
    return new Promise(resolve => {
      Animated.timing(this.state.scaleAnim, {
        duration: CLOSE_ANIM_DURATION,
        toValue: 0,
        easing: Easing.in(Easing.cubic),
      }).start(resolve);
    });
  }

  render() {
    const { style, children, layouts, ...other } = this.props;
    const animation = {
      transform: [ { scale: this.state.scaleAnim } ],
      opacity: this.state.scaleAnim,
    };
    const position = computePosition(layouts);
    return (
      <Animated.View {...other} style={[styles.options, style, animation, position]}>
        {children}
      </Animated.View>
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
