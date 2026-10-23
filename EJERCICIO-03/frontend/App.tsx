import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Mascota = {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
  ciudad: string;
  nivelEnergia: string; // RETO
};

const API_URL = 'http://192.168.104.67:3000';

export default function App() {
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL + '/mascotas/1')
      .then((r) => {
        if (!r.ok) throw new Error('Mascota no encontrada');
        return r.json();
      })
      .then((dato: Mascota) => setMascota(dato))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <SafeAreaView style={styles.container}><Text>{error}</Text></SafeAreaView>;
  if (!mascota) return <SafeAreaView style={styles.container}><Text>Cargando...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🐶</Text>
        <Text style={styles.title}>{mascota.nombre}</Text>
        <Text>{mascota.raza}</Text>
        <Text>{mascota.edad} años · {mascota.ciudad}</Text>
        {/* RETO: dato que viene de PostgreSQL */}
        <Text style={styles.energia}>⚡ Energía {mascota.nivelEnergia}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#EEF6FF' },
  card: { backgroundColor: '#FFF', padding: 28, borderRadius: 24, alignItems: 'center' },
  emoji: { fontSize: 56 },
  title: { fontSize: 28, fontWeight: '800' },
  energia: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#B45309' },
});