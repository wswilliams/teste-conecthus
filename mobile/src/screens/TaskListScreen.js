import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { connectToTaskNotifications } from '../services/mqttService';
import { deleteTask, listTasks } from '../services/taskService';

export function TaskListScreen({ navigation }) {
  const { userId, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mqttState, setMqttState] = useState('disconnected');

  async function loadTasks() {
    try {
      const response = await listTasks();
      setTasks(Array.isArray(response) ? response : []);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Nao foi possivel carregar tarefas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();

    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadTasks();
    });

    return unsubscribeFocus;
  }, [navigation]);

  useEffect(() => {
    const mqttConnection = connectToTaskNotifications({
      userId,
      onStateChange: setMqttState,
      onMessage: (payload) => {
        const title = payload?.event === 'task.created' ? 'Nova tarefa criada' : 'Notificacao de tarefa';
        const message = payload?.title
          ? `${payload.title} (status: ${payload.status || 'n/a'})`
          : 'Atualizacao recebida via MQTT';

        Alert.alert(title, message);
        loadTasks();
      },
    });

    return () => mqttConnection.disconnect();
  }, [userId]);

  async function onDelete(taskId) {
    const confirmed = await new Promise((resolve) => {
      Alert.alert('Excluir tarefa', 'Deseja realmente excluir esta tarefa?', [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao excluir tarefa');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tarefas</Text>
          <Text style={styles.mqtt}>MQTT: {mqttState}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('TaskForm', { mode: 'create' })}>
            <Text style={styles.secondaryButtonText}>Nova</Text>
          </Pressable>
          <Pressable style={styles.dangerButton} onPress={logout}>
            <Text style={styles.dangerButtonText}>Sair</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTasks} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Nenhuma tarefa encontrada.</Text> : null}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardStatus}>Status: {item.status}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.cardActions}>
              <Pressable style={styles.smallButton} onPress={() => navigation.navigate('TaskForm', { mode: 'edit', taskId: item.id })}>
                <Text style={styles.smallButtonText}>Editar</Text>
              </Pressable>
              <Pressable style={[styles.smallButton, styles.smallDanger]} onPress={() => onDelete(item.id)}>
                <Text style={styles.smallDangerText}>Excluir</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  mqtt: {
    marginTop: 4,
    color: '#475569',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#0369a1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 12,
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardStatus: {
    color: '#0f766e',
    fontWeight: '600',
  },
  cardDescription: {
    color: '#334155',
  },
  cardActions: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  smallDanger: {
    backgroundColor: '#fee2e2',
  },
  smallDangerText: {
    color: '#991b1b',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 32,
  },
});
