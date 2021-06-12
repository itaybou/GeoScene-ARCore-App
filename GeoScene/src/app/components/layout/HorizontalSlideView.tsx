import {
  Dimensions,
  GestureResponderEvent,
  LayoutAnimation,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface HorizontalSlideViewProps {
  animation: string;
}

const DEVICE_WIDTH = Dimensions.get('window').width;

export const HorizontalSlideView: React.FC<HorizontalSlideViewProps> = ({
  children,
  animation,
}) => {
  const SWIPE_WIDTH = 100;
  const [left, setLeft] = useState<number>(SWIPE_WIDTH);
  const width = SWIPE_WIDTH;
  let customStyle: ViewStyle = {
    right: 0,
    left,
    width,
  };
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [panResponder, setPanResponder] = useState<PanResponderInstance | null>(
    null,
  );

  const viewRef = useRef<View | null>(null);

  const panResponderMove = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (collapsed && gestureState.dx < -80) {
        customStyle.left = left - gestureState.dx;
        customStyle.width = DEVICE_WIDTH + gestureState.dx;
        collapsed && setCollapsed(false);
        updateNativeProps();
      } else if (!collapsed && gestureState.dx > 15) {
        setLeft(0);
        customStyle.left = gestureState.dx;
        customStyle.width = -gestureState.dx + SWIPE_WIDTH;
        updateNativeProps();
        !collapsed && setCollapsed(true);
      }
    },
    [collapsed, customStyle.left, customStyle.width, left],
  );
  const panResponderRelease = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (gestureState.dx > 200) {
        customStyle.left = 0;
        customStyle.width = 0;
        updateNativeProps();
        collapsed && setCollapsed(false);
      }
    },
    [],
  );

  const updateNativeProps = () => {
    switch (animation) {
      case 'linear':
        LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        break;
      case 'spring':
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        LayoutAnimation.spring();
        break;
      case 'easeInEaseOut':
        LayoutAnimation.easeInEaseOut();
        break;
      case 'none':
      default:
        break;
    }
    viewRef.current && viewRef.current.setNativeProps(customStyle);
  };

  useEffect(() => {
    setPanResponder(
      PanResponder.create({
        onMoveShouldSetPanResponder: (event, gestureState) => {
          return (
            Math.abs(gestureState.dx) >= 5 || Math.abs(gestureState.dy) >= 5
          );
        },
        onPanResponderMove: panResponderMove,
        onPanResponderRelease: panResponderRelease,
      }),
    );
  }, [panResponderMove, panResponderRelease]);

  return (
    <View
      style={[styles.wrapSwipe, { width: SWIPE_WIDTH }]}
      ref={(ref) => (viewRef.current = ref)}
      {...panResponder?.panHandlers}>
      {children}
      <Text>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapSwipe: {
    //flex: 1,
    backgroundColor: '#ff5500',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: 0,
  },
});
