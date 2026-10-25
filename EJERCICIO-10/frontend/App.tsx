import { useEffect, useState } from 'react';
import { Button, FlatList, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';

type Destino = {
  id: number;
  ciudad: string;
  pais: string;
  descripcion: string;
  prioridad: number; // MEJORA
  visitado: boolean; // MEJORA
};

const API_URL = 'http://192.168.1.131:3000';

// MEJORA: el dato es numérico; la etiqueta es solo presentación
const PRIORIDADES: Record<number, { texto: string; color: string }> = {
  1: { texto: 'BAJA', color: '#64748B' },
  2: { texto: 'MEDIA', color: '#D97706' },
  3: { texto: 'ALTA', color: '#DC2626' },
};

export default function App() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState(2);
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [error, setError] = useState('');

  async function request(url: string, options?: RequestInit) {
    const r = await fetch(url, options);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r;
  }

  // READ (con filtro opcional)
  async function cargar() {
    try {
      const url = API_URL + '/destinos' + (soloPendientes ? '?pendientes=true' : '');
      const r = await request(url);
      setDestinos(await r.json());
      setError('');
    } catch { setError('No se pudieron cargar los destinos.'); }
  }
  useEffect(() => { cargar(); }, [soloPendientes]);

  // CREATE
  async function crear() {
    if (!ciudad.trim() || !pais.trim()) { setError('Ciudad y país son obligatorios.'); return; }
    try {
      await request(API_URL + '/destinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciudad: ciudad.trim(),
          pais: pais.trim(),
          descripcion: descripcion.trim() || 'Nuevo destino',
          prioridad,
        }),
      });
      setCiudad(''); setPais(''); setDescripcion(''); setPrioridad(2);
      await cargar();
    } catch { setError('No se pudo crear.'); }
  }

  // UPDATE genérico (PATCH)
  async function actualizar(id: number, cambios: Partial<Destino>) {
    try {
      await request(API_URL + '/destinos/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      });
      await cargar();
    } catch { setError('No se pudo actualizar.'); }
  }

  // DELETE con confirmación (web y móvil)
  function confirmarEliminar(d: Destino) {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar ' + d.ciudad + '?')) eliminar(d.id);
      return;
    }
    Alert.alert('Eliminar destino', d.ciudad, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(d.id) },
    ]);
  }

  async function eliminar(id: number) {
    try {
      await request(API_URL + '/destinos/' + id, { method: 'DELETE' });
      await cargar();
    } catch { setError('No se pudo eliminar.'); }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🌍 Wander</Text>
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {/* Formulario de alta */}
      <TextInput style={styles.input} placeholder="Ciudad" value={ciudad} onChangeText={setCiudad} />
      <TextInput style={styles.input} placeholder="País" value={pais} onChangeText={setPais} />
      <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />

      <View style={styles.fila}>
        <Text style={styles.label}>Prioridad:</Text>
        {[1, 2, 3].map((p) => (
          <Pressable
            key={p}
            onPress={() => setPrioridad(p)}
            style={[styles.chip, prioridad === p && { backgroundColor: PRIORIDADES[p].color, borderColor: PRIORIDADES[p].color }]}
          >
            <Text style={[styles.chipTexto, prioridad === p && styles.chipTextoActivo]}>{PRIORIDADES[p].texto}</Text>
          </Pressable>
        ))}
      </View>
      <Button title="Crear destino" onPress={crear} />

      {/* MEJORA: filtro de pendientes */}
      <Pressable onPress={() => setSoloPendientes(!soloPendientes)} style={styles.filtro}>
        <Text style={styles.filtroTexto}>{soloPendientes ? '☑' : '☐'} Mostrar solo pendientes</Text>
      </Pressable>

      <FlatList
        data={destinos}
        keyExtractor={(x) => String(x.id)}
        ListEmptyComponent={<Text>No hay destinos.</Text>}
        renderItem={({ item }) => {
          const p = Number(item.prioridad);
          const info = PRIORIDADES[p] ?? PRIORIDADES[2];
          return (
            <View style={[styles.card, item.visitado && styles.cardVisitado]}>
              <Text style={styles.ciudad}>🌍 {item.ciudad}</Text>
              <Text>{item.pais} · <Text style={{ color: info.color, fontWeight: '800' }}>Prioridad {info.texto}</Text></Text>
              <Text style={styles.descripcion}>{item.descripcion}</Text>
              {item.visitado && <Text style={styles.visitado}>✓ Visitado</Text>}

              <View style={styles.fila}>
                <Button title="▲" disabled={p >= 3} onPress={() => actualizar(item.id, { prioridad: p + 1 })} />
                <Button title="▼" disabled={p <= 1} onPress={() => actualizar(item.id, { prioridad: p - 1 })} />
                <Button
                  title={item.visitado ? 'Desmarcar' : 'Marcar visitado'}
                  onPress={() => actualizar(item.id, { visitado: !item.visitado })}
                />
                <Button title="Eliminar" color="#DC2626" onPress={() => confirmarEliminar(item)} />
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F0F9FF' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 12 },
  error: { color: '#DC2626', marginBottom: 8 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginBottom: 8 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginVertical: 8 },
  label: { fontWeight: '700' },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFF' },
  chipTexto: { color: '#334155', fontWeight: '600' },
  chipTextoActivo: { color: '#FFF' },
  filtro: { marginVertical: 12 },
  filtroTexto: { fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginBottom: 10 },
  cardVisitado: { opacity: 0.65 },
  ciudad: { fontSize: 18, fontWeight: '700' },
  descripcion: { marginTop: 4, color: '#475569' },
  visitado: { marginTop: 4, color: '#15803D', fontWeight: '700' },
});