import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingView({ label = 'Carregando...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0f766e" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: '#334155',
  },
});
