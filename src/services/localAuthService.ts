import { User } from '../types';

const USERS_KEY = 'safeconnect_users';
const CURRENT_USER_KEY = 'safeconnect_current_user';

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  accountType: 'announcer' | 'user';
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Obtener usuarios del localStorage
function getStoredUsers(): (User & { password: string })[] {
  const data = localStorage.getItem(USERS_KEY);
  let users: (User & { password: string })[] = data ? JSON.parse(data) : [];
  let changed = false;

  users = users.map(user => {
    const role = user.role || (user.accountType === 'announcer' ? 'announcer' : user.accountType === 'admin' ? 'admin' : 'user');
    const accountType = user.accountType || (role === 'admin' ? 'admin' : role === 'announcer' ? 'announcer' : 'user');
    if (user.role !== role || user.accountType !== accountType) {
      changed = true;
    }
    return { ...user, role, accountType };
  });

  const hasAdmin = users.some(user => user.role === 'admin');
  if (!hasAdmin) {
    users.push({
      uid: 'admin_seed',
      email: 'admin@safeconnect.co',
      password: 'admin123',
      name: 'Administrador',
      displayName: 'Administrador',
      accountType: 'admin',
      role: 'admin',
      phone: '',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff&size=200',
      photoURL: '',
      verified: true,
      verificationLevel: 'premium',
      online: true,
      isOnline: true,
      rating: 5,
      reviewCount: 0,
      premium: true,
      vip: false,
      isVip: false,
      services: [],
      images: [],
      gallery: [],
      availability: [],
      memberSince: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    changed = true;
  }

  if (changed) {
    saveStoredUsers(users);
  }

  return users;
}

// Guardar usuarios
function saveStoredUsers(users: (User & { password: string })[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const localAuthService = {
  login({ email, password }: LoginData): User {
    const users = getStoredUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Correo o contraseña incorrectos');
    }
    const { password: _, ...userWithoutPassword } = found;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  },

  register({ email, password, displayName, accountType, phone }: RegisterData): User {
    const users = getStoredUsers();

    // Verificar si ya existe
    if (users.find(u => u.email === email)) {
      throw new Error('Ya existe una cuenta con este correo electrónico');
    }

    const role: User['role'] = accountType === 'announcer' ? 'announcer' : 'user';

    const newUser: User & { password: string } = {
      uid: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email,
      password,
      name: displayName,
      displayName,
      accountType,
      role,
      phone: phone || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f43f5e&color=fff&size=200`,
      photoURL: '',
      verified: false,
      verificationLevel: 'none',
      online: true,
      isOnline: true,
      rating: 0,
      reviewCount: 0,
      premium: false,
      vip: false,
      isVip: false,
      services: [],
      images: [],
      gallery: [],
      availability: [],
      memberSince: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  },

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  updateProfile(uid: string, updates: Partial<User>): User {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.uid === uid);
    if (index === -1) throw new Error('Usuario no encontrado');

    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    saveStoredUsers(users);

    const { password: _, ...userWithoutPassword } = users[index];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  },

  getRegisteredUsers(): User[] {
    return getStoredUsers().map(({ password: _, ...u }) => u);
  }
};
