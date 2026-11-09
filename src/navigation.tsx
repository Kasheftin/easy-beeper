import { createStaticNavigation, type StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import MainScreen from './screens/MainScreen'
import SettingsScreen from './screens/SettingsScreen'

const RootStack = createNativeStackNavigator({
  screens: {
    Main: { screen: MainScreen, options: { headerShown: false } },
    Settings: { screen: SettingsScreen, options: { title: 'Settings' } }
  }
})

export type RootStackParamList = StaticParamList<typeof RootStack>

export const Navigation = createStaticNavigation(RootStack)
