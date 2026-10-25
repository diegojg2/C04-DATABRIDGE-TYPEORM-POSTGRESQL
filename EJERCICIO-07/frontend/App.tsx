import { useEffect, useState } from 'react';
import { Button, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Sneaker = {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  talla: number;
  stock: number;
};

const API_URL = 'http://192.168.1.131:3000';

export default function App() {
  const [items, setItems] = useState<Sneaker[]>([]);
  const [error, setError] = useState('');

  async function request(url: string, options?: RequestInit) {
    const r = await fetch(url, options);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r;
  }

  async function cargar() {
    try {
      const r = await request(API_URL + '/sneakers');
      setItems(await r.json());
      setError('');
    } catch {
      setError('No se pudo conectar con la API.');
    }
  }
  useEffect(() => { cargar(); }, []);

  // CREATE
  async function crear(datos: Omit<Sneaker, 'id'>) {
    try {
      await request(API_URL + '/sneakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      await cargar();
    } catch { setError('Error al crear.'); }
  }

  async function actualizar(id: number, cambios: Partial<Sneaker>) {
    try {
      await request(API_URL + '/sneakers/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      });
      await cargar();
    } catch { setError('Error al actualizar.'); }
  }

  // DELETE
  async function eliminar(id: number) {
    try {
      await request(API_URL + '/sneakers/' + id, { method: 'DELETE' });
      await cargar();
    } catch { setError('Error al eliminar.'); }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>👟 Sneaker Vault</Text>
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <View style={styles.fila}>
        <Button
          title="Nueva (stock 4)"
          onPress={() => crear({ marca: 'Nike', modelo: 'Air Max 1', precio: 149.99, talla: 42, stock: 4 })}
        />
        <Button
          title="Nueva agotada"
          onPress={() => crear({ marca: 'Adidas', modelo: 'Forum Low', precio: 109.99, talla: 43, stock: 0 })}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => {
          const stock = Number(item.stock);
          const agotado = stock === 0;

          return (
            <View style={styles.card}>
              <Text style={styles.modelo}>👟 {item.modelo}</Text>
              <Text>{item.marca} · Talla {item.talla} · {Number(item.precio).toFixed(2)} €</Text>

              {agotado
                ? <Text style={styles.agotado}>AGOTADO</Text>
                : <Text style={styles.stock}>Stock {stock}</Text>}

              <View style={styles.fila}>
                <Button
                  title="Vender 1"
                  disabled={agotado}
                  onPress={() => actualizar(item.id, { stock: stock - 1 })}
                />
                <Button title="Reponer +5" onPress={() => actualizar(item.id, { stock: stock + 5 })} />
                <Button title="Rebajar" onPress={() => actualizar(item.id, { precio: 139.99 })} />
                <Button title="Eliminar" color="#DC2626" onPress={() => eliminar(item.id)} />
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 12 },
  error: { color: '#DC2626', marginBottom: 8 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 },
  modelo: { fontSize: 18, fontWeight: '700' },
  stock: { marginTop: 6, fontWeight: '700', color: '#15803D' },
  agotado: { marginTop: 6, fontWeight: '800', color: '#DC2626' },
});