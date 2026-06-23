import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoadingView } from './src/components/LoadingView';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { TaskFormScreen } from './src/screens/TaskFormScreen';
import { TaskListScreen } from './src/screens/TaskListScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView label="Restaurando sessao..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="TaskForm"
              component={TaskFormScreen}
              options={({ route }) => ({
                title: route.params?.mode === 'edit' ? 'Editar tarefa' : 'Nova tarefa',
              })}
            />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detalhe da tarefa' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
