import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { renderMobileAppModel } from './index'

export default function App() {
  const model = renderMobileAppModel()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>GoHealTrail</Text>
        <Text style={styles.subtitle}>Malaysia trail planning and safety</Text>

        {model.sections.map((section) => (
          <View key={section} style={styles.section}>
            <Text style={styles.heading}>{section}</Text>
            {section === 'Discover trails' && (
              <Text>{model.trails.length} sample trails available</Text>
            )}
            {section === 'Trip planner' && (
              <Text>Build a one-day plan with a safety checklist.</Text>
            )}
            {section === 'Community updates' && (
              <Text>Authenticated trail condition reports.</Text>
            )}
            {section === 'Emergency' && (
              <Text>Use the SOS flow when conditions become unsafe.</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b1220' },
  container: { padding: 20, gap: 16 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#b7c3d4', fontSize: 16 },
  section: { backgroundColor: '#172238', borderRadius: 12, padding: 16, gap: 8 },
  heading: { color: '#ffffff', fontSize: 19, fontWeight: '600' },
})
