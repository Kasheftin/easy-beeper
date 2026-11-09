import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { useBeeperContext } from '../beeperContext'
import { BeeperStatus } from '../useBeeper'
import { useNavigation } from '@react-navigation/native'
import { IconButton } from '../components/IconButton'
import { colors, font, spacing } from '../theme'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function MainScreen() {
  const beeper = useBeeperContext()
  const minutes = Math.floor(beeper.elapsed / 60);
  const seconds = beeper.elapsed % 60;
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Easy Beeper</Text>

      <Text style={styles.counter}>
        {pad(minutes)}:{pad(seconds)}
      </Text>

      <View style={styles.actions}>
        {beeper.status === BeeperStatus.running ? (
          <IconButton
            icon="pause"
            onPress={beeper.pause}
            variant="danger"
          />
        ) : (
          <IconButton
            icon="play"
            onPress={beeper.play}
            variant="primary"
          />
        )}
        {beeper.status === BeeperStatus.idle ? (
          <IconButton
            icon="cog"
            onPress={() => navigation.navigate('Settings')}
            variant="neutral"
          />
        ) : (
          <IconButton
            icon="stop"
            onPress={beeper.stop}
            variant="danger"
          />
        )}
      </View>

      <Text style={styles.config}>
        {beeper.beeps.map((b) => `${b.sound} every ${b.interval}s at ${b.at} (vol ${b.volume})`).join(
          '\n',
        )}
      </Text>

      {beeper.error ? <Text style={styles.error}>{beeper.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: { color: colors.muted, fontSize: font.md, textTransform: 'uppercase' },
  counter: { color: colors.text, fontSize: font.counter, fontVariant: ['tabular-nums'] },
  config: { color: colors.muted, fontSize: font.sm, textAlign: 'center', marginTop: spacing.md },
  error: { color: colors.danger, fontSize: font.sm, textAlign: 'center' },
});
