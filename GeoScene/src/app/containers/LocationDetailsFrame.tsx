import {
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PageHeaderContentType,
  getPageHeaderContent,
  getPageThumbnail,
  getPageURL,
} from '../api/mediawiki/MediaWikiAPI';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Center } from '../components/layout/Center';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeIcon } from '../components/assets/ThemeIcon';
import { ThemeText } from '../components/text/ThemeText';
import { WebViewScreen } from './screens/WebViewScreen';
import useTheme from '../utils/hooks/useTheme';

interface LocationDetailsFrameProps {
  name?: string;
  onClose: () => void;
  onExpand: () => void;
}

export const LocationDetailsFrame: React.FC<LocationDetailsFrameProps> = ({
  name,
  onClose,
  onExpand,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [pageId, setPageId] = useState<number | null>(null);
  const [pageURL, setPageURL] = useState<string | undefined>(undefined);
  const [thumbnailUri, setThumbnailUri] = useState<string | undefined>(
    undefined,
  );

  const getLocationDetails = useCallback(async () => {
    if (name) {
      const detailsHeader:
        | PageHeaderContentType
        | undefined = await getPageHeaderContent(name);
      detailsHeader && setDetails(detailsHeader.content);
      detailsHeader && setPageId(detailsHeader.page_id);
      name && setThumbnailUri(await getPageThumbnail(name));
    }
    setLoading(false);
  }, [name]);

  const closeLocationDetails = useCallback(() => {
    onClose();
    setLoading(true);
    setExpanded(false);
  }, [onClose]);

  const closeButton = useMemo(
    () => (
      <RNBounceable onPress={closeLocationDetails}>
        <ThemeIcon name="close" color={theme.colors.text} size={25} />
      </RNBounceable>
    ),
    [closeLocationDetails, theme.colors.text],
  );

  const expandDetails = useCallback(async () => {
    setExpanded(!expanded);
    setLoading(true);
    onExpand();
    if (pageId) {
      setPageURL(await getPageURL(pageId));
      setLoading(false);
    }
  }, [expanded, onExpand, pageId]);

  useEffect(() => {
    setLoading(true);
    getLocationDetails();
  }, [getLocationDetails]);

  console.log(pageURL);

  return (
    <View style={[styles.container, { padding: expanded ? 0 : 12 }]}>
      {expanded && pageURL ? (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
          }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexDirection: 'row',
            }}>
            <View style={{ marginEnd: 16 }}>
              <RNBounceable onPress={expandDetails}>
                <ThemeIcon
                  name="arrow-down"
                  color={theme.colors.text}
                  size={22}
                />
              </RNBounceable>
            </View>
            {closeButton}
          </View>
          <WebViewScreen
            uri={pageURL}
            style={{ flex: 1 }}
            name={name ?? 'Wikipedia'}
            showWebControls={true}
          />
        </View>
      ) : loading ? (
        <Center style={{ flex: 1, zIndex: 1 }}>
          {/* <ThemeText>{loadingMessage}</ThemeText> */}
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </Center>
      ) : (
        <View
          style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start' }}>
          <View style={{ flex: 0.8 }}>
            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                paddingEnd: 16,
              }}>
              <ThemeText style={{ fontWeight: 'bold', fontSize: 20 }}>
                {name}
              </ThemeText>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <RNBounceable onPress={expandDetails}>
                  <View
                    style={{
                      backgroundColor: theme.colors.accent,
                      borderRadius: 10,
                      flexDirection: 'row',
                      paddingVertical: 3,
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      justifyContent: 'center',
                      marginEnd: 10,
                    }}>
                    <ThemeIcon
                      name="book-open"
                      color={theme.colors.text}
                      size={18}
                    />
                    <ThemeText
                      style={{
                        fontWeight: 'bold',
                        fontSize: 10,
                        marginLeft: 6,
                      }}>
                      Wikipedia
                    </ThemeText>
                  </View>
                </RNBounceable>
                {closeButton}
              </View>
            </View>
            {/* <TabBarIcon name="close" color={theme.colors.accent} /> */}
            <ThemeText>{details}</ThemeText>
          </View>
          <View style={{ flex: 0.2 }}>
            {thumbnailUri && (
              <Image source={{ uri: thumbnailUri }} style={{ flex: 1 }} />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
