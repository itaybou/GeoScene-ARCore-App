import { ActivityIndicator, Searchbar } from 'react-native-paper';
import {
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  LocationSearchResult,
  searchPlacesByName,
} from '../../api/nomination/OSMNominationAPI';
import React, { useState } from 'react';

import { ThemeIcon } from '../assets/ThemeIcon';
import { ThemeText } from '../text/ThemeText';
import useTheme from '../../utils/hooks/useTheme';

interface LocationSearchBarProps {
  onItemSelected: (item: LocationSearchResult) => void;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  onItemSelected,
}) => {
  const theme = useTheme();
  const [previousQuery, setPreviousQuery] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [resultsShown, setResultsShown] = useState<boolean>(false);

  const searchResults = () => {
    setLoading(true);
    if (previousQuery !== query) {
      searchPlacesByName(query).then((res) => {
        Keyboard.dismiss();
        setResults(res);
        setResultsShown(true);
        setLoading(false);
      });
    }
  };

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          elevation: 510,
        }}>
        <Searchbar
          textAlign="left"
          style={{
            flex: 0.85,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.inactiveTint,
            color: theme.colors.text,
          }}
          inputStyle={{
            color: theme.colors.text,
          }}
          iconColor={theme.colors.text}
          placeholder=""
          onChangeText={(text) => {
            setPreviousQuery(query);
            setQuery(text);
          }}
          value={query}
        />
        <TouchableOpacity
          style={[
            styles.searchButton,
            { backgroundColor: theme.colors.accent_secondary },
          ]}
          onPress={searchResults}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.text} />
          ) : (
            <ThemeIcon name="magnifier" color={theme.colors.text} />
          )}
        </TouchableOpacity>
      </View>
      {resultsShown && query !== '' && (
        <FlatList
          data={results}
          style={[
            styles.flatList,
            {
              backgroundColor: theme.colors.tabs,
              borderColor: theme.colors.accent,
            },
          ]}
          keyExtractor={(place) => place.index.toString()}
          extraData={query}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onItemSelected(item);
                setResultsShown(false);
              }}
              style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'flex-start',
                  borderBottomWidth: 1,
                  paddingHorizontal: 8,
                  borderBottomColor: theme.colors.inactiveTint,
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flex: 0.1,
                    height: '100%',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={{ uri: item.icon }}
                    style={{ width: '45%', flex: 1 }}
                    resizeMode={'contain'}
                  />
                </View>
                <View style={{ flex: 0.9 }}>
                  <ThemeText style={[styles.flatListItem]}>
                    {item.display_name}
                  </ThemeText>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  flatList: {
    elevation: 3,
  },
  flatListItem: {
    paddingLeft: 15,
    marginTop: 15,
    paddingBottom: 15,
    fontSize: 12,
    zIndex: 100,
  },

  searchButton: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',

    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 10,
  },
});
