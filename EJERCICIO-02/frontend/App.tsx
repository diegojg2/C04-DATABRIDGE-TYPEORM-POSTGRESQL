import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Pelicula = {
  id: number;
  titulo: string;
  genero: string;
  anio: number;
  puntuacion: number;
  favorita: boolean; // RETO
};

const API_URL = 'http://192.168.104.67:3000';

export default function App() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);

  useEffect(() => {
    fetch(API_URL + '/peliculas')
      .then((respuesta) => respuesta.json())
      .then((datos: Pelicula[]) => setPeliculas(datos));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎬 CineBox</Text>
      <FlatList
        data={peliculas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.movie}>🎬 {item.titulo}</Text>
              <Text style={[styles.heart, item.favorita && styles.heartOn]}>
                {item.favorita ? '♥' : '♡'}
              </Text>
            </View>
            <Text>{item.genero} · {item.anio}</Text>
            <Text>⭐ {Number(item.puntuacion).toFixed(1)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  movie: { fontSize: 18, fontWeight: '700' },
  heart: { fontSize: 22, color: '#94A3B8' },
  heartOn: { color: '#E11D48' },
});