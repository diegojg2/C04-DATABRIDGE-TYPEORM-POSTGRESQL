import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Libro = { id: number; titulo: string; autor: string; genero: string; leido: boolean };

const API_URL = 'http://192.168.1.131:3000';

export default function App() {
  const [libros, setLibros] = useState<Libro[]>([]);

  async function cargar() {
    const r = await fetch(API_URL + '/libros');
    setLibros(await r.json());
  }
  useEffect(() => { cargar(); }, []);

  function confirmar(libro: Libro) {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar ' + libro.titulo + '?')) eliminar(libro.id);
      return;
    }
    Alert.alert('Eliminar libro', libro.titulo, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(libro.id) },
    ]);
  }

  async function eliminar(id: number) {
    await fetch(API_URL + '/libros/' + id, { method: 'DELETE' });
    setLibros((actuales) => actuales.filter((l) => l.id !== id));
  }

  async function marcarLeido(id: number) {
    const r = await fetch(API_URL + '/libros/' + id + '/leido', { method: 'PATCH' });
    if (r.ok) await cargar();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📚 My Library</Text>
      <FlatList
        data={libros}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.libro}>📚 {item.titulo}</Text>
            <Text>
              {item.autor} · {item.leido ? 'Leído ✓' : 'Pendiente'}
            </Text>
            <View style={styles.botones}>
              {!item.leido && (
                <Button title="Marcar como leído" onPress={() => marcarLeido(item.id)} />
              )}
              <Button title="Eliminar" color="#DC2626" onPress={() => confirmar(item)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 },
  libro: { fontSize: 18, fontWeight: '700' },
  botones: { flexDirection: 'row', gap: 8, marginTop: 10 },
});