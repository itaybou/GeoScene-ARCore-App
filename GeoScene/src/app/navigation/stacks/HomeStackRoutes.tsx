import {
  HomeRoutesParamList,
  HomeStackRouteNavProps,
} from '../params/RoutesParamList';
import {
  LocationCardType,
  PlacesCardCarousel,
} from '../../components/layout/PlacesCardCarousel';
import React, { useCallback, useState } from 'react';
import {
  useAsyncStorage,
  useGeolocation,
  useSettings,
  useTheme,
  useUser,
} from '../../utils/hooks/Hooks';

import { Center } from '../../components/layout/Center';
import { ErrorModal } from '../../components/modals/ErrorModal';
import { Geography } from '../../../native/NativeModulesBridge';
import Header from '../../containers/Header';
import { Overpass } from '../../../native/NativeModulesBridge';
import { PageCard } from '../../components/layout/PageCard';
import { ThemeButton } from '../../components/input/ThemeButton';
import { ThemeIcon } from '../../components/assets/ThemeIcon';
import { ThemeLogo } from '../../components/assets/ThemeLogo';
import { ThemeText } from '../../components/text/ThemeText';
import { View } from 'react-native';
import { auth } from '../../auth/Authentication';
import { createStackNavigator } from '@react-navigation/stack';
import promisify from '../../api/promisify';
import { useEffect } from 'react';

interface StackProps {}

const Stack = createStackNavigator<HomeRoutesParamList>();

const REFRESH_LOCATIONS_SEC_INTERVAL = 20 * 60;
const REFRESH_LOCATIONS_DISTANCE_M = 3 * 1000;
const REFRESH_LOCATIONS_RADIUS_DIFF = 4;

function Home({ route, navigation }: HomeStackRouteNavProps<'Home'>) {
  const location = useGeolocation();
  const theme = useTheme();
  const { state, dispatch } = useUser();
  const settings = useSettings();

  const { getStorage, updateStorage } = useAsyncStorage<LocationCardType>(
    'locations',
  );

  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);

  const [cardDetails, setCardDetails] = useState<LocationCardType | undefined>(
    undefined,
  );
  const [cardsError, setCardsError] = useState<boolean>(false);

  const checkForLocationsRefresh = useCallback(async (radius: number) => {
    const time = Math.floor(Date.now() / 1000);
    const locationData = await getStorage();
    if (locationData) {
      const { distance } = await Geography.distance({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      // Check that REFRESH_LOCATIONS_SEC_INTERVAL minutes passed
      // or that the distance interval is more than REFRESH_LOCATIONS_DISTANCE_M meter
      if (
        time > locationData.timestamp + REFRESH_LOCATIONS_SEC_INTERVAL ||
        (distance && distance > REFRESH_LOCATIONS_DISTANCE_M) ||
        Math.abs(locationData.radius - radius) >= REFRESH_LOCATIONS_RADIUS_DIFF
      ) {
        fetchLocationImages(time, radius);
      } else setCardDetails(locationData);
    } else fetchLocationImages(time, radius);
  }, []);

  const fetchLocationImages = useCallback(
    async (timestamp: number, radius: number) => {
      await promisify(
        'getImagesAround',
        Overpass,
      )(settings.state.visibleRadius)
        .then((response) => {
          const details = {
            data: response.data,
            latitude: response.latitude,
            longitude: response.longitude,
            radius,
            timestamp,
          };
          setCardDetails(details);
          setCardsError(false);
          updateStorage(details);
        })
        .catch((err) => {
          setCardsError(true);
          setErrorModalVisible(true);
          console.error(err);
        });
    },
    [],
  );

  useEffect(() => {
    if (settings.state.initialized) {
      checkForLocationsRefresh(settings.state.visibleRadius);
    }

    return () => Overpass.clearRequest();
  }, [settings.state.initialized, settings.state.visibleRadius]);

  return (
    <>
      <Center>
        <ThemeLogo height={60} width={400} />
        <PageCard>
          <ThemeText style={{ fontSize: 18, fontWeight: 'bold' }}>
            Device Sensors:
          </ThemeText>
          {location.loading ? (
            <ThemeText>Loading...</ThemeText>
          ) : (
            <>
              <ThemeText>Latitude: {location.latitude?.toFixed(6)}</ThemeText>
              <ThemeText>Longitude: {location.longitude?.toFixed(6)}</ThemeText>
              <ThemeText>Accuracy: {location.accuracy?.toFixed(2)}m</ThemeText>
              <ThemeText>Altitude: {location.altitude?.toFixed(3)}m</ThemeText>
              <ThemeText>Speed: {location.speed?.toFixed(2)}m/s</ThemeText>
              {location.error && (
                <ThemeText
                  style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                  {`Error: ${location.error.message}`}
                </ThemeText>
              )}
            </>
          )}
        </PageCard>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            width: '100%',
            paddingHorizontal: 14,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ThemeIcon name="picture" size={18} color={theme.colors.text} />
            <ThemeText
              style={{ fontSize: 18, fontWeight: 'bold', marginStart: 8 }}>
              Nearby Locations
            </ThemeText>
          </View>
        </View>
        <PlacesCardCarousel
          items={cardDetails?.data}
          error={cardsError}
          removeItem={(index: number) => {
            if (cardDetails && cardDetails?.data) {
              cardDetails.data.splice(index, 1);
              updateStorage(cardDetails);
            }
          }}
        />
        {!state.user && (
          <PageCard>
            <ThemeText>
              Login to OpenStreetMap for more functionality.
            </ThemeText>
            <View style={{ marginTop: 5 }}>
              <ThemeButton
                text={'Login'}
                icon={'login'}
                onPress={() => auth(dispatch)}
              />
            </View>
          </PageCard>
        )}
      </Center>
      <ErrorModal
        isVisible={errorModalVisible}
        text={
          'Unable to load nearby locations due to too many requests sent, please try again later.'
        }
        hide={() => setErrorModalVisible(false)}
      />
    </>
  );
}

export const HomeStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
};
