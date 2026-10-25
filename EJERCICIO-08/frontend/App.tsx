import { useEffect, useState } from 'react';
import { Button, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type Cancion = { id: number; titulo: string; artista: string };
type Playlist = { id: number; nombre: string; canciones: Cancion[] };

const API_URL = 'http://192.168.1.131:3000';

export default function App() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [nuevaId, setNuevaId] = useState<number | null>(null); // para marcar NUEVA

  async function cargar() {
    const r = await fetch(API_URL + '/playlists/1');
    setPlaylist(await r.json());
  }
  useEffect(() => { cargar(); }, []);

  // RETO: crear canción asociada a ESTA playlist
  async function anadir() {
    if (!playlist || !titulo.trim() || !artista.trim()) {
      setMensaje('Rellena título y artista');
      return;
    }

    const r = await fetch(API_URL + '/playlists/canciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: titulo.trim(),
        artista: artista.trim(),
        playlistId: playlist.id, // a qué playlist pertenece
      }),
    });

    if (r.ok) {
      const actualizada: Playlist = await r.json();
      const ultima = actualizada.canciones[actualizada.canciones.length - 1];
      setNuevaId(ultima?.id ?? null);
      await cargar(); // recargamos la playlist desde la API
      setTitulo('');
      setArtista('');
      setMensaje('Canción añadida ✓');
    } else {
      setMensaje('Error al añadir');
    }
  }

  if (!playlist) return <SafeAreaView style={styles.container}><Text>Cargando...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎵 {playlist.nombre}</Text>

      <FlatList
        data={playlist.canciones}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cancion}>🎵 {item.titulo}</Text>
            <Text>
              {item.artista}
              {item.id === nuevaId && <Text style={styles.nueva}>  · NUEVA</Text>}
            </Text>
          </View>
        )}
      />

      <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
      <TextInput style={styles.input} placeholder="Artista" value={artista} onChangeText={setArtista} />
      <Button title="＋ Añadir canción" onPress={anadir} />
      <Text style={styles.mensaje}>{mensaje}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F3FF' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginBottom: 10 },
  cancion: { fontSize: 17, fontWeight: '700' },
  nueva: { color: '#7C3AED', fontWeight: '800' },
  input: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginTop: 10 },
  mensaje: { marginTop: 10 },
});