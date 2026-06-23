import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { listUsersForSelect } from '../services/userService';

export function UserSelect({ value, onChange, label = 'Usuário', placeholder = 'Selecionar usuário' }) {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadUsers() {
      if (!visible || users.length > 0) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await listUsersForSelect(token);
        setUsers(Array.isArray(response) ? response : []);
      } catch (err) {
        setError(err.message || 'Falha ao carregar usuários');
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [visible, token, users.length]);

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === String(value)) || null,
    [users, value],
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => String(user.name || '').toLowerCase().includes(normalizedQuery));
  }, [query, users]);

  function handleSelect(user) {
    onChange?.(user.id);
    setVisible(false);
    setQuery('');
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={[styles.triggerText, !selectedUser && styles.placeholderText]} numberOfLines={1}>
          {selectedUser?.name || placeholder}
        </Text>
      </Pressable>

      {selectedUser ? <Text style={styles.helper}>Selecionado: {selectedUser.name}</Text> : null}

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar usuário</Text>
              <Pressable onPress={() => setVisible(false)}>
                <Text style={styles.closeText}>Fechar</Text>
              </Pressable>
            </View>

            <TextInput
              placeholder="Buscar por nome"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {loading ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color="#0f766e" />
                <Text style={styles.stateText}>Carregando usuários...</Text>
              </View>
            ) : error ? (
              <View style={styles.stateBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.stateText}>Nenhum usuário encontrado.</Text>}
                renderItem={({ item }) => {
                  const isSelected = String(item.id) === String(value);

                  return (
                    <Pressable
                      style={[styles.userRow, isSelected && styles.userRowSelected]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.userName}>{item.name}</Text>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  trigger: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  triggerText: {
    color: '#0f172a',
  },
  placeholderText: {
    color: '#64748b',
  },
  helper: {
    color: '#475569',
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeText: {
    color: '#0369a1',
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  listContent: {
    gap: 8,
    paddingBottom: 4,
  },
  userRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  userRowSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#ecfdf5',
  },
  userName: {
    color: '#0f172a',
    fontWeight: '600',
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  stateText: {
    color: '#475569',
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});