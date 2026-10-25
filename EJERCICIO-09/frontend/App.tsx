import { useEffect, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Evento = { id: number; nombre: string; ciudad: string; categoria: string; fecha: string };

const API_URL = 'http://192.168.1.131:3000';

const CIUDADES = ['Zaragoza', 'Madrid'];
const CATEGORIAS = ['Tecnologia', 'Musica'];

export default function App() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [ciudad, setCiudad] = useState<string>('Zaragoza');      // '' = todas
  const [categoria, setCategoria] = useState<string>('Tecnologia'); // '' = todas
  const [url, setUrl] = useState('');

  // RETO: construir la URL solo con los filtros que existan
  async function filtrar() {
    const params: string[] = [];
    if (ciudad) params.push('ciudad=' + encodeURIComponent(ciudad));
    if (categoria) params.push('categoria=' + encodeURIComponent(categoria));

    const ruta = '/eventos' + (params.length ? '?' + params.join('&') : '');
    setUrl(ruta);

    const r = await fetch(API_URL + ruta);
    setEventos(await r.json());
  }

  // Cada vez que cambia un filtro, se vuelve a consultar la API
  useEffect(() => { filtrar(); }, [ciudad, categoria]);

  function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={[styles.chip, activo && styles.chipActivo]}>
        <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{texto}</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎟️ Event Radar</Text>

      <Text style={styles.label}>📍 Ciudad</Text>
      <View style={styles.fila}>
        <Chip texto="Todas" activo={ciudad === ''} onPress={() => setCiudad('')} />
        {CIUDADES.map((c) => (
          <Chip key={c} texto={c} activo={ciudad === c} onPress={() => setCiudad(c)} />
        ))}
      </View>

      <Text style={styles.label}>🏷️ Categoría</Text>
      <View style={styles.fila}>
        <Chip texto="Todas" activo={categoria === ''} onPress={() => setCategoria('')} />
        {CATEGORIAS.map((c) => (
          <Chip key={c} texto={c} activo={categoria === c} onPress={() => setCategoria(c)} />
        ))}
      </View>

      <Text style={styles.url}>GET {url}</Text>

      <FlatList
        data={eventos}
        keyExtractor={(x) => String(x.id)}
        ListEmptyComponent={<Text>No hay eventos con estos filtros.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>🎟️ {item.nombre}</Text>
            <Text>{item.ciudad} · {item.categoria}</Text>
            <Text style={styles.fecha}>{item.fecha}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F0FDF4' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 12 },
  label: { fontWeight: '700', marginTop: 8 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1' },
  chipActivo: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  chipTexto: { color: '#334155' },
  chipTextoActivo: { color: '#FFF', fontWeight: '700' },
  url: { fontFamily: 'monospace', color: '#64748B', marginVertical: 8 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginBottom: 10 },
  nombre: { fontSize: 17, fontWeight: '700' },
  fecha: { marginTop: 4, color: '#15803D' },
});