import React, {useRef, useEffect} from 'react';
import {View, Text, Alert} from 'react-native';
import moment from 'moment';
import {useAppState} from '../../hooks/AppState';
import {useDispatch} from '../../hooks/Dispatch';
import {useInterval} from '../../hooks/Interval';
import {getLocation, getNewLocationHistory} from '../../utils/common';
import {getLocationDetails, checkHttpStat} from '../../actions/index';
import {SET_LOCATION} from '../../state/types';
import {AppState} from '../../types/common';
import styles from '../../styles/styles';
import CurrentLocation from '../../components/CurrentLocation';
import LocationHistory from '../../components/LocationHistory';

const Location: React.FC = () => {
  const state = useAppState();
  const dispatch = useDispatch();
  const stateRef = useRef<AppState | null>(null);

  const saveCurrentLocation = async () => {
    const data = await getLocation();
    if (data) {
      const locationDetails = await getLocationDetails(
        data.latitude,
        data.longitude,
      );
      if (locationDetails.success) {
        const statusData = await checkHttpStat(locationDetails.data);
        if (statusData.success && state) {
          const newHistory = getNewLocationHistory(
            stateRef.current?.currentLocation || state.currentLocation,
            stateRef.current?.locationHistory || state.locationHistory,
          );
          const time = moment();
          dispatch?.({
            type: SET_LOCATION,
            payload: {
              currentLocation: {
                id: time.format('MM:SS'),
                name: locationDetails.data,
                time: `${time.format('DD/MM/YYYY')}, ${time.format(
                  'HH:MM:SS',
                )}`,
              },
              locationHistory: newHistory,
            },
          });
        } else {
          Alert.alert('Error', statusData.data);
        }
      } else {
        Alert.alert('Error', locationDetails.data);
      }
    }
  };

  useInterval(() => {
    saveCurrentLocation();
  }, 10000);

  useEffect(() => {
    stateRef.current = state || null;
  }, [state?.currentLocation?.id]);

  if (!state) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Location Manager</Text>
      <Text style={styles.subHeader}>Current Location</Text>
      <CurrentLocation data={state.currentLocation} />
      <Text style={styles.subHeader}>Previous Locations</Text>
      <LocationHistory history={state.locationHistory} />
    </View>
  );
};

export default Location;
