import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { UserSelect } from '../components/UserSelect';
import { createTask, getTaskById, updateTask } from '../services/taskService';

export function TaskFormScreen({ navigation, route }) {
  const { userId } = useAuth();
  const mode = route.params?.mode || 'create';
  const taskId = route.params?.taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [taskUserId, setTaskUserId] = useState(userId ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !taskId) {
      return;
    }

    async function loadTask() {
      setLoading(true);
      try {
        const task = await getTaskById(taskId);
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.status || 'PENDING');
        setTaskUserId(task.userId ?? userId ?? null);
      } catch (err) {
        Alert.alert('Erro', err.message || 'Falha ao carregar tarefa');
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [mode, taskId, userId]);

  async function onSave() {
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status: status.trim(),
      };

      if (mode === 'edit') {
        await updateTask(taskId, payload);
      } else {
        if (!taskUserId) {
          Alert.alert('Erro', 'Selecione um usuário para criar a tarefa');
          return;
        }

        await createTask({ ...payload, userId: Number(taskUserId) });
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{mode === 'edit' ? 'Editar tarefa' : 'Nova tarefa'}</Text>

        <TextInput placeholder="Titulo" value={title} onChangeText={setTitle} style={styles.input} />

        <TextInput
          placeholder="Descricao"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
        />

        <TextInput placeholder="Status" value={status} onChangeText={setStatus} style={styles.input} />

        {mode === 'create' ? <UserSelect value={taskUserId} onChange={setTaskUserId} /> : null}

        <Pressable disabled={loading} style={styles.primaryButton} onPress={onSave}>
          <Text style={styles.primaryButtonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
