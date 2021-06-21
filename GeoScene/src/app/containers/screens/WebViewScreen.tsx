import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { Center } from '../../components/layout/Center';
import { ThemeIcon } from '../../components/assets/ThemeIcon';
import useTheme from '../../utils/hooks/useTheme';

interface WebViewButtonProps {
  handler: () => void;
  iconName: string;
  text: string;
  disabled: boolean;
}

const WebViewButton: React.FC<WebViewButtonProps> = ({
  handler,
  iconName,
  text,
  disabled,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity disabled={disabled} onPress={handler}>
      <View style={styles.button}>
        <ThemeIcon
          name={iconName}
          color={disabled ? theme.colors.inactiveTint : theme.colors.text}
        />
        <Text
          style={[
            styles.buttonText,
            disabled ? styles.inactiveButtonText : null,
            { color: disabled ? theme.colors.inactiveTint : theme.colors.text },
          ]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface WebViewScreenProps {
  uri: string;
  style?: ViewStyle;
  name: string;
  onMessage?: (event: WebViewMessageEvent) => void;
  injectedCode?: string;
  showWebControls: boolean;
}

export const WebViewScreen: React.FC<WebViewScreenProps> = ({
  uri,
  style,
  name,
  onMessage,
  injectedCode,
  showWebControls = true,
}) => {
  const theme = useTheme();
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>(uri);

  const webviewRef = useRef(null);

  const backButtonHandler = () => {
    webviewRef.current && webviewRef.current.goBack();
  };

  const frontButtonHandler = () => {
    webviewRef.current && webviewRef.current.goForward();
  };

  const refreshButtonHandler = () => {
    webviewRef.current && webviewRef.current.reload();
  };

  const initialButtonHandler = () => {
    if (currentUrl === uri) {
      refreshButtonHandler();
    } else {
      setCurrentUrl(uri);
    }
  };

  return (
    <>
      <WebView
        ref={webviewRef}
        style={[styles.container, style, { bottom: showWebControls ? 50 : 0 }]}
        source={{ uri: currentUrl }}
        originWhitelist={['https://*']}
        startInLoadingState={true}
        androidHardwareAccelerationDisabled={false}
        domStorageEnabled={injectedCode !== undefined}
        javaScriptEnabledAndroid={injectedCode !== undefined}
        injectedJavaScript={injectedCode}
        onMessage={onMessage}
        renderLoading={() => (
          <Center style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.accent} size="large" />
          </Center>
        )}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          setCanGoForward(navState.canGoForward);
          setCurrentUrl(navState.url);
        }}
      />
      {showWebControls && (
        <View
          style={[
            styles.tabBarContainer,
            { backgroundColor: theme.colors.tabs },
          ]}>
          <WebViewButton
            text="Back"
            iconName="arrow-left-circle"
            handler={backButtonHandler}
            disabled={!canGoBack}
          />
          <WebViewButton
            text="Refresh"
            iconName="refresh"
            handler={refreshButtonHandler}
            disabled={false}
          />
          <WebViewButton
            text={name}
            iconName="direction"
            handler={initialButtonHandler}
            disabled={currentUrl === uri}
          />
          <WebViewButton
            text="Next"
            iconName="arrow-right-circle"
            handler={frontButtonHandler}
            disabled={!canGoForward}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  tabBarContainer: {
    width: '100%',
    padding: 15,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-around',
    margin: 0,
    elevation: 20,
    borderTopWidth: 0.1,
    height: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonText: {
    fontSize: 10,
    marginLeft: 5,
  },
  inactiveButtonText: {
    textDecorationLine: 'line-through',
  },
});
