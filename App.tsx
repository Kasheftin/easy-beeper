import { DarkTheme } from '@react-navigation/native'

import { BeeperProvider } from './src/beeperContext'
import { Navigation } from './src/navigation'
import { SettingsProvider } from './src/settingsContext'

export default function App() {
  return (
    <SettingsProvider>
      <BeeperProvider>
        <Navigation theme={DarkTheme} />
      </BeeperProvider>
    </SettingsProvider>
  )
}
