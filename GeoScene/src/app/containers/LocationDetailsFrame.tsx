import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import {
  PageHeaderContentType,
  getGoogleSearchURL,
  getPageHeaderContent,
  getPageThumbnail,
  getPageURL,
} from '../api/mediawiki/MediaWikiAPI';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

import { Center } from '../components/layout/Center';
import FastImage from 'react-native-fast-image';
import { ThemeButton } from '../components/input/ThemeButton';
import { ThemeIcon } from '../components/assets/ThemeIcon';
import { ThemeText } from '../components/text/ThemeText';
import { WebViewScreen } from './screens/WebViewScreen';
import useTheme from '../utils/hooks/useTheme';

interface LocationDetailsFrameProps {
  name_en?: string;
  name_heb?: string;
  main_name?: string;
  type?: string;
  elevation?: number;
  distance?: string;
  onClose: () => void;
  onExpand: () => void;
}

const imagePlaceholder = require('../assets/img/image_placeholder.jpg');

export const LocationDetailsFrame: React.FC<LocationDetailsFrameProps> = ({
  name_en,
  name_heb,
  main_name,
  type,
  elevation,
  distance,
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
    if (name_en) {
      const detailsHeader:
        | PageHeaderContentType
        | undefined = await getPageHeaderContent(name_en);
      detailsHeader ? setDetails(detailsHeader.content) : setDetails('');
      detailsHeader ? setPageId(detailsHeader.page_id) : setPageId(null);
      if (detailsHeader) {
        const thumbnail_uri = await getPageThumbnail(name_en);
        thumbnail_uri
          ? setThumbnailUri(thumbnail_uri)
          : setThumbnailUri(undefined);
      } else setThumbnailUri(undefined);
    } else if (name_heb) {
      const detailsHeader:
        | PageHeaderContentType
        | undefined = await getPageHeaderContent(name_heb, true);
      detailsHeader ? setDetails(detailsHeader.content) : setDetails('');
      detailsHeader ? setPageId(detailsHeader.page_id) : setPageId(null);
      if (detailsHeader) {
        const thumbnail_uri = await getPageThumbnail(name_heb, true);
        thumbnail_uri
          ? setThumbnailUri(thumbnail_uri)
          : setThumbnailUri(undefined);
      } else setThumbnailUri(undefined);
    } else {
      setDetails('');
      setPageId(null);
      setThumbnailUri(undefined);
    }
    setLoading(false);
  }, [name_en, name_heb]);

  const closeLocationDetails = useCallback(() => {
    onClose();
    setLoading(true);
    setExpanded(false);
  }, [onClose]);

  const closeButton = useMemo(
    () => (
      <TouchableOpacity onPress={closeLocationDetails}>
        <ThemeIcon name="close" color={theme.colors.text} size={25} />
      </TouchableOpacity>
    ),
    [closeLocationDetails, theme.colors.text],
  );

  const expandDetails = useCallback(async () => {
    setExpanded(!expanded);
    setLoading(true);
    onExpand();
    if (pageId) {
      setPageURL(await getPageURL(pageId, !name_en));
      setLoading(false);
    }
  }, [expanded, onExpand, pageId]);

  const searchGoogle = useCallback(async () => {
    setExpanded(!expanded);
    setLoading(true);
    onExpand();
    if (name_en ?? name_heb ?? main_name) {
      setPageURL(getGoogleSearchURL(name_en ?? name_heb ?? main_name));
      setLoading(false);
    }
  }, [expanded, onExpand, name_en, name_heb, main_name]);

  useEffect(() => {
    setLoading(true);
    getLocationDetails();
  }, [getLocationDetails]);

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
              <TouchableOpacity onPress={expandDetails}>
                <ThemeIcon
                  name="arrow-down"
                  color={theme.colors.text}
                  size={22}
                />
              </TouchableOpacity>
            </View>
            {closeButton}
          </View>
          {pageURL && (
            <WebViewScreen
              uri={pageURL}
              style={{ flex: 1 }}
              name={name_en ?? name_heb ?? main_name ?? 'Wikipedia'}
              showWebControls={true}
            />
          )}
        </View>
      ) : loading ? (
        <View style={{ flexDirection: 'column' }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemeText style={{ fontWeight: 'bold', fontSize: 20 }}>
              {name_en ?? name_heb ?? main_name}
            </ThemeText>
            {closeButton}
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.colors.cards,
            }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      ) : (
        <View
          style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start' }}>
          <View style={{ flex: 0.8, paddingHorizontal: 10 }}>
            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                paddingEnd: 16,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                <ThemeText style={{ fontWeight: 'bold', fontSize: 20 }}>
                  {!loading && (name_en ?? name_heb ?? main_name)}
                </ThemeText>
                <View
                  style={{
                    marginStart: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <ThemeText style={{ fontSize: 12 }}>
                    {!loading && type}
                  </ThemeText>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                {details !== '' && details !== undefined && (
                  <View style={{ flexDirection: 'row', marginEnd: 10 }}>
                    <ThemeButton
                      onPress={searchGoogle}
                      text="Google"
                      icon={'social-google'}
                      lean={true}
                    />

                    <ThemeButton
                      onPress={expandDetails}
                      text="Wikipedia"
                      icon={'book-open'}
                      lean={true}
                    />
                  </View>
                )}

                {closeButton}
              </View>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
              <ThemeText style={{ fontSize: 12 }}>
                {!loading && elevation && `Est. Elevation: ${elevation}`}
              </ThemeText>
              <ThemeText style={{ fontSize: 12, marginStart: 16 }}>
                {!loading && distance && `Distance: ${distance}`}
              </ThemeText>
            </View>
            <ScrollView>
              {details ? (
                <ThemeText>{details}</ThemeText>
              ) : (
                <View>
                  <ThemeText
                    style={{
                      color: theme.colors.error,
                    }}>{`No wikipedia details found for ${
                    name_en ?? name_heb ?? main_name
                  }`}</ThemeText>
                  <ThemeButton
                    onPress={searchGoogle}
                    text="Search Google"
                    icon={'social-google'}
                  />
                </View>
              )}
            </ScrollView>
          </View>
          <View
            style={{
              flex: 0.2,
            }}>
            <FastImage
              source={
                thumbnailUri !== undefined
                  ? {
                      uri: thumbnailUri,
                      headers: { Authorization: 'token' },
                      priority: FastImage.priority.high,
                    }
                  : imagePlaceholder
              }
              resizeMode={FastImage.resizeMode.cover}
              style={{
                flex: 1,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
