import { User, UserRole } from '../types/traffic';

const ADMIN_USER: User = {
  id: 'usr-admin-01',
  username: 'admin',
  name: 'Traffic Operations Lead',
  role: 'ADMIN',
  title: 'AUTHORIZED TRAFFIC CONTROL OPERATOR',
  avatar: '👮‍♂️',
  permissions: [
    'VIEW_NETWORK',
    'VIEW_RISK',
    'VIEW_CASCADE',
    'RUN_SCENARIO',
    'CREATE_INTERVENTION',
    'MODIFY_INTERVENTION',
    'ACCEPT_INTERVENTION',
    'REJECT_INTERVENTION',
    'VIEW_EMERGENCY',
    'VIEW_AUDIT',
    'VIEW_SYSTEM',
    'ACCESS_COPILOT'
  ]
};

const CITIZEN_USER: User = {
  id: 'usr-cit-01',
  username: 'citizen',
  name: 'Alex Chen',
  role: 'USER',
  title: 'CITIZEN MOBILITY USER',
  avatar: '🚗',
  permissions: [
    'VIEW_CITIZEN_MAP',
    'VIEW_ROUTE',
    'VIEW_RISK',
    'VIEW_ALERT',
    'SUBMIT_FEEDBACK'
  ]
};

const STORAGE_KEY = 'aura_twin_auth_user';

export class AuthService {
  private static currentUser: User | null = null;
  private static listeners: ((user: User | null) => void)[] = [];

  public static initialize(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  public static getCurrentUser(): User | null {
    if (!this.currentUser) {
      this.initialize();
    }
    return this.currentUser;
  }

  public static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  public static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions.includes(permission) : false;
  }

  public static login(username: string, password: string, requestedRole: UserRole): { success: boolean; error?: string; user?: User } {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (requestedRole === 'ADMIN') {
      // DEMO authentication requirements: username: admin, password: 12345678
      if (cleanUser === 'admin' && cleanPass === '12345678') {
        this.currentUser = ADMIN_USER;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ADMIN_USER));
        this.notifyListeners();
        return { success: true, user: ADMIN_USER };
      }
      return { success: false, error: 'Invalid username or password.' };
    } else {
      // Citizen User demo auth: accept demo credentials or valid user
      if ((cleanUser === 'citizen' && cleanPass === 'user123') || (cleanUser.length > 0 && cleanPass.length >= 4)) {
        const user: User = {
          ...CITIZEN_USER,
          username: cleanUser || 'citizen',
          name: cleanUser === 'citizen' ? 'Alex Chen' : `${cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1)} (Citizen)`
        };
        this.currentUser = user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.notifyListeners();
        return { success: true, user };
      }
      return { success: false, error: 'Invalid username or password.' };
    }
  }

  public static logout(): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }

  public static subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(l => l(this.currentUser));
  }
}
