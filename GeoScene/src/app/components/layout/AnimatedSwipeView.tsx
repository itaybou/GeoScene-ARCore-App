import {
  Animated,
  Button,
  Dimensions,
  Easing,
  GestureResponderEvent,
  Keyboard,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';

import { TabBarIcon } from '../tabs/TabBarIcon';
import { useTheme } from '../../utils/hooks/Hooks';

const { width } = Dimensions.get('window');

interface AnimatedSwipeViewProps {
  duration: number;
  onCloseAnimation?: () => void;
  isViewOpen: boolean;
  fromValue: number;
  toValue: number;
}

interface MapButtonProps {
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}

const MapButton: React.FC<MapButtonProps> = ({ onPress }) => {
  const theme = useTheme();

  return (
    <View style={styles.mapButtonWrapper}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.mapButton, { backgroundColor: theme.colors.tabs }]}>
        <TabBarIcon name="map" color={theme.colors.accent} size={20} />
      </TouchableOpacity>
    </View>
  );
};

export const AnimatedSwipeView: React.FC<AnimatedSwipeViewProps> = ({
  children,
  duration,
  isViewOpen,
  onCloseAnimation,
  toValue,
  fromValue,
}) => {
  const TIMING_CONFIG = {
    duration: duration ?? 200,
    easing: Easing.inOut(Easing.ease),
  };

  const [isShown, setShown] = useState<boolean>(false);

  const pan = useRef(new Animated.ValueXY()).current;
  let [isAnimating, setIsAnimating] = useState<boolean>(false);

  let animatedValueX = 0;
  let animatedValueY = 0;

  // const panResponder = useRef(
  //   PanResponder.create({
  //     // Ask to be the responder:
  //     onStartShouldSetPanResponder: () => false,
  //     onStartShouldSetPanResponderCapture: () => false,
  //     onMoveShouldSetPanResponder: (evt, gestureState) =>
  //       !isAnimating && gestureState.dx > 22,
  //     onPanResponderGrant: () => {
  //       pan.setOffset({
  //         x: animatedValueX,
  //         y: animatedValueY,
  //       });
  //       pan.setValue({ x: 0, y: 0 }); // Initial value
  //     },
  //     onPanResponderMove: (evt, gestureState) => {
  //       console.log(gestureState.dx, gestureState.dy);
  //       if (gestureState.dx > 0) {
  //         pan.setValue({ x: gestureState.dx, y: 0 });
  //       }
  //     },
  //     onPanResponderRelease: (evt, gestureState) => {
  //       // The user has released all touches while this view is the
  //       // responder. This typically means a gesture has succeeded
  //       // Flatten the offset so it resets the default positioning
  //       console.log(gestureState.dx, gestureState.dy);
  //       if (gestureState.dx > 0 && gestureState.vx > 0) {
  //         if (gestureState.vx >= 0.5 || gestureState.dx >= 100) {
  //           setIsAnimating(true);
  //           Animated.timing(pan, {
  //             toValue: { x: gestureState.dx > 0 ? gestureState.dx : 0, y: 0 },
  //             ...TIMING_CONFIG,
  //             useNativeDriver: false,
  //           }).start(() => {
  //             setIsAnimating(false);
  //             onCloseAnimation && onCloseAnimation();
  //           });
  //         }
  //         // } else {
  //         //   setIsAnimating(true);
  //         //   Animated.spring(pan, {
  //         //     toValue: { x: gestureState.dx, y: 0 },
  //         //     useNativeDriver: false,
  //         //   }).start(() => {
  //         //     setIsAnimating(false);
  //         //   });
  //         // }
  //       }
  //     },
  //   }),
  // ).current;

  useEffect(() => {
    if (isViewOpen) {
      animatedValueX = 0;
      animatedValueY = 0;
      pan.setOffset({
        x: animatedValueX,
        y: animatedValueY,
      });
      pan.setValue({
        x: 0,
        y: -width,
      }); // Initial value
      pan.x.addListener((value) => (animatedValueX = value.value));
      pan.y.addListener((value) => (animatedValueY = value.value));
    }
  }, [isViewOpen]);

  // useEffect(() => {
  //   if (props.PressToanimate) {
  //     setIsAnimating(true);
  //     Animated.timing(pan, {
  //       toValue: {
  //         x: 0,
  //         y: props.PressToanimateDirection == 'up' ? -height : height,
  //       },
  //       ...TIMING_CONFIG,
  //       useNativeDriver: false,
  //     }).start(() => {
  //       setIsAnimating(false);
  //       props.onClose();
  //     });
  //   }
  // }, [props.PressToanimate]);

  // let handleGetStyle = (opacity: number) => {
  //   return [
  //     [
  //       styles.container,
  //       {
  //         transform: [{ translateX: pan.x }, { translateY: pan.y }],
  //         opacity: opacity,
  //       },
  //       // [props.HeaderStyle],
  //     ],
  //   ];
  // };

  let handleGetStyleBody = (opacity: Animated.AnimatedInterpolation) => {
    return [
      [
        styles.background,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          opacity: opacity,
        },
      ],
      // [props.ContentModalStyle],
    ];
  };
  let handleMainBodyStyle = (opacity: Animated.AnimatedInterpolation) => {
    return [
      [
        styles.ContainerModal,
        {
          opacity: opacity,
        },
      ],
      // [props.MainContainerModal],
    ];
  };

  let interpolateBackgroundOpacity = pan.y.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0, 1, 0],
  });
  return (
    <Animated.View
      style={{
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        backgroundColor: '#ff5588',
      }}
      // {...panResponder.panHandlers}
    >
      <View style={{ flex: 1 }}>
        {/* <Button
          title="t"
          onPress={() => {
            console.log('Pressed');
          }}
        /> */}
        <MapButton
          onPress={() => {
            console.log('Presseddd');
            setIsAnimating(true);
            Animated.timing(pan, {
              ...TIMING_CONFIG,
              toValue: { x: isViewOpen ? 0 : -toValue, y: 0 },
              useNativeDriver: false,
            }).start(() => {
              setShown(!isViewOpen);
              console.log(pan.x);
              setIsAnimating(false);
            });
          }}
        />
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  background: {
    opacity: 0,
    flex: 1,
    marginTop: 55,
  },
  container: {
    marginTop: 50,
    position: 'absolute',
    width: '100%',
  },
  ContainerModal: { backgroundColor: 'rgba(0, 0, 0, 0.5)', flex: 1 },
  ImageBackground: {
    width: '100%',
    height: '100%',
  },
  TouchWithoutFeedBack: { flex: 1 },
  mapButtonWrapper: {
    flex: 0.001,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButton: {
    width: 65,
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingStart: 9,
    borderRadius: 60,
  },
});
