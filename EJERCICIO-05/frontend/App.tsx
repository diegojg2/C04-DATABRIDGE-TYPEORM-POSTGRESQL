import { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type Viaje = {
  id: number;
  destino: string;
  pais: string;
  fecha: string;
  estado: string;
};

const API_URL = 'http://192.168.104.67:3000';

// '2027-04-10' → '10/04/2027'
function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

export default function App() {
  const [estado, setEstado] = useState('RESERVADO');
  const [fecha, setFecha] = useState(''); // RETO
  const [mensaje, setMensaje] = useState('');
  const [viaje, setViaje] = useState<Viaje | null>(null);

  async function actualizar() {
    // PATCH: enviamos solo los campos que el usuario ha rellenado
    const cambios: { estado?: string; fecha?: string } = {};
    if (estado.trim()) cambios.estado = estado.trim();
    if (fecha.trim()) cambios.fecha = fecha.trim();

    const r = await fetch(API_URL + '/viajes/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios),
    });

    if (r.ok) {
      setViaje(await r.json());
      setMensaje('Viaje actualizado ✓');
    } else {
      setMensaje('No se pudo actualizar');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>✈️ Travel Book</Text>

      <Text style={styles.label}>Estado</Text>
      <TextInput style={styles.input} value={estado} onChangeText={setEstado} />

      <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="2027-04-10" value={fecha} onChangeText={setFecha} />

      <Button title="Guardar cambios" onPress={actualizar} />
      <Text style={styles.mensaje}>{mensaje}</Text>

      {/* Tarjeta con lo que devolvió la API */}
      {viaje && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✈️ {viaje.destino}</Text>
          <Text>{viaje.pais} · {viaje.estado}</Text>
          <Text style={styles.fecha}>📅 Fecha: {formatearFecha(viaje.fecha)}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { padding: 14, backgroundColor: '#F1F5F9', marginVertical: 8, borderRadius: 10 },
  mensaje: { marginVertical: 12 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  fecha: { marginTop: 6, fontWeight: '600', color: '#0369A1' },
});