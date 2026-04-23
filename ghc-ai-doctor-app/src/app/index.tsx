import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function Index() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>Hello World - GHC-AI Doctor App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
