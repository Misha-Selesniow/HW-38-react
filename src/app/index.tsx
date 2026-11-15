import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [isOn, setIsOn] = useState(false);
  const [isSos, setIsSos] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!isSos) {
      return undefined;
    }

    Vibration.vibrate(250);

    const intervalId = setInterval(() => {
      setIsOn((current) => !current);
      Vibration.vibrate(250);
    }, 500);

    return () => {
      clearInterval(intervalId);
      Vibration.cancel();
    };
  }, [isSos]);

  const toggleTorch = () => {
    if (isSos) {
      return;
    }

    Vibration.vibrate(100);
    setIsOn((current) => !current);
  };

  const toggleSos = () => {
    Vibration.vibrate(100);
    setIsOn(!isSos);
    setIsSos(!isSos);
  };

  const handlePermissionRequest = async () => {
    try {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Потрібен доступ до камери',
          'Надайте доступ у налаштуваннях пристрою, щоб користуватися ліхтариком.',
        );
      }
    } catch (error) {
      Alert.alert('Не вдалося запросити доступ', String(error));
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.messageText}>Перевірка дозволу на камеру…</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.messageText}>
          Для роботи ліхтарика потрібен доступ до камери.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handlePermissionRequest}
          style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Надати доступ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isOn ? '#FFD700' : '#1E1E1E' },
      ]}>
      <StatusBar barStyle="light-content" />
      <CameraView
        facing="back"
        enableTorch={isOn}
        style={styles.camera}
      />

      <View pointerEvents="none" style={styles.gridOverlay}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.gridRow}>
            {[0, 1, 2].map((column) => (
              <View
                key={column}
                style={[
                  styles.gridCell,
                  column === 1 && styles.borderLeftRight,
                  row === 1 && styles.borderTopBottom,
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.topBar}>
        <Text style={styles.smallButtonText}>
          ЛІХТАРИК: {isOn ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: isSos }}
          onPress={toggleSos}
          style={[styles.smallButton, isSos && styles.activeSmallButton]}>
          <Text
            style={[
              styles.smallButtonText,
              isSos && styles.activeSmallButtonText,
            ]}>
            {isSos ? 'ЗУПИНИТИ SOS' : 'SOS'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isOn ? 'Вимкнути ліхтарик' : 'Увімкнути ліхтарик'}
          accessibilityState={{ disabled: isSos }}
          disabled={isSos}
          onPress={toggleTorch}
          style={[styles.shutterButton, isSos && styles.disabledButton]}>
          <View
            style={[
              styles.shutterInner,
              !isOn && styles.shutterInnerOff,
            ]}
          />
        </TouchableOpacity>
        <Text style={styles.buttonText}>
          {isSos ? 'SOS активний' : 'Ліхтарик'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    ...StyleSheet.absoluteFill,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  smallButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  activeSmallButton: {
    backgroundColor: '#FFD700',
  },
  activeSmallButtonText: {
    color: '#000',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  shutterInnerOff: {
    backgroundColor: '#666',
  },
  disabledButton: {
    opacity: 0.6,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'column',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
  },
  borderLeftRight: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  borderTopBottom: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
