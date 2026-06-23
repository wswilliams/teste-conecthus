import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTaskById } from '../services/taskService';

export function TaskDetailScreen({ navigation, route }) {
  const taskId = route.params?.taskId;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      setError('');

      try {
        const response = await getTaskById(taskId);
        setTask(response);
      } catch (err) {
        setError(err.message || 'Falha ao carregar tarefa');
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [taskId]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {loading ? <ActivityIndicator size="large" color="#0f766e" /> : null}

        {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && task ? (
          <View style={styles.card}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.meta}>Status: {task.status}</Text>
            <Text style={styles.meta}>Usuario: {task.userId}</Text>
            <Text style={styles.meta}>
              Criada em: {task.createat ? new Date(task.createat).toLocaleString('pt-BR') : '-'}
            </Text>
            <Text style={styles.description}>{task.description}</Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate('TaskForm', { mode: 'edit', taskId: task.id })}
            >
              <Text style={styles.primaryButtonText}>Editar tarefa</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    color: '#334155',
    fontWeight: '500',
  },
  description: {
    marginTop: 2,
    color: '#1e293b',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 10,
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#b91c1c',
  },
});
