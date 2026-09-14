import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from './firebase.ts';
import { Todo, User, UserSettings } from '../types.ts';

/**
 * Normalizes user ID for Firestore documents (can be number or string)
 */
export function getFirestoreUserId(userId: number | string | undefined | null, email?: string): string {
  if (userId) return String(userId);
  if (email) return email.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  return 'default_user';
}

/**
 * Saves or updates a user profile in Firestore
 */
export async function syncUserProfileToFirestore(user: User): Promise<void> {
  try {
    const userIdStr = getFirestoreUserId(user.id, user.email);
    const userRef = doc(db, 'users', userIdStr);
    await setDoc(
      userRef,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone || 'Asia/Kolkata',
        welcomeEmailSent: user.welcomeEmailSent || false,
        welcomeEmailSeen: user.welcomeEmailSeen || false,
        welcomeEmailSeenAt: user.welcomeEmailSeenAt || null,
        welcomeNotificationCount: user.welcomeNotificationCount || 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore syncUserProfile warning:', error);
  }
}

/**
 * Saves or updates a single todo in Firestore
 */
export async function saveTodoToFirestore(userId: number | string, todo: Todo): Promise<void> {
  try {
    const userIdStr = getFirestoreUserId(userId);
    const todoIdStr = String(todo.id);
    const todoRef = doc(db, 'users', userIdStr, 'todos', todoIdStr);

    await setDoc(
      todoRef,
      {
        id: todo.id,
        userId: todo.userId,
        title: todo.title,
        description: todo.description || '',
        dueDate: todo.dueDate,
        dueTime: todo.dueTime || null,
        reminderMinutesBefore: todo.reminderMinutesBefore ?? null,
        reminderScheduledTime: todo.reminderScheduledTime || null,
        reminderSent: todo.reminderSent || false,
        completed: todo.completed || false,
        completedAt: todo.completedAt || null,
        completionEmailSent: todo.completionEmailSent || false,
        missedTaskEmailSent: todo.missedTaskEmailSent || false,
        priority: todo.priority || 'medium',
        category: todo.category || 'General',
        createdAt: todo.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore saveTodo error:', error);
  }
}

/**
 * Deletes a todo from Firestore
 */
export async function deleteTodoFromFirestore(userId: number | string, todoId: number | string): Promise<void> {
  try {
    const userIdStr = getFirestoreUserId(userId);
    const todoIdStr = String(todoId);
    const todoRef = doc(db, 'users', userIdStr, 'todos', todoIdStr);
    await deleteDoc(todoRef);
  } catch (error) {
    console.warn('Firestore deleteTodo error:', error);
  }
}

/**
 * Batch saves multiple todos to Firestore
 */
export async function batchSyncTodosToFirestore(userId: number | string, todos: Todo[]): Promise<void> {
  try {
    const promises = todos.map((todo) => saveTodoToFirestore(userId, todo));
    await Promise.allSettled(promises);
  } catch (error) {
    console.warn('Firestore batchSyncTodos error:', error);
  }
}

/**
 * Subscribes to real-time updates from Firestore for a given user's todos
 */
export function subscribeToUserTodos(
  userId: number | string,
  onUpdate: (todos: Todo[]) => void
): () => void {
  try {
    const userIdStr = getFirestoreUserId(userId);
    const todosCollection = collection(db, 'users', userIdStr, 'todos');

    const unsubscribe = onSnapshot(
      todosCollection,
      (snapshot) => {
        const todos: Todo[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          todos.push({
            id: typeof data.id === 'number' ? data.id : parseInt(docSnap.id, 10) || (docSnap.id as any),
            userId: typeof data.userId === 'number' ? data.userId : Number(userId) || 1,
            title: data.title || '',
            description: data.description || '',
            dueDate: data.dueDate || new Date().toISOString().split('T')[0],
            dueTime: data.dueTime || null,
            reminderMinutesBefore: data.reminderMinutesBefore ?? null,
            reminderScheduledTime: data.reminderScheduledTime || null,
            reminderSent: Boolean(data.reminderSent),
            completed: Boolean(data.completed),
            completedAt: data.completedAt || null,
            completionEmailSent: Boolean(data.completionEmailSent),
            missedTaskEmailSent: Boolean(data.missedTaskEmailSent),
            priority: data.priority || 'medium',
            category: data.category || 'General',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
        // Sort by dueDate and priority
        todos.sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));
        if (todos.length > 0) {
          onUpdate(todos);
        }
      },
      (error) => {
        console.warn('Firestore subscription error (fallback to local/server sync):', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore subscribe error:', err);
    return () => {};
  }
}

/**
 * Saves user settings in Firestore
 */
export async function saveUserSettingsToFirestore(
  userId: number | string,
  settings: Partial<UserSettings>
): Promise<void> {
  try {
    const userIdStr = getFirestoreUserId(userId);
    const settingsRef = doc(db, 'users', userIdStr, 'settings', 'config');
    await setDoc(
      settingsRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore saveUserSettings warning:', error);
  }
}
