// Local Storage utility functions for demo purposes
// In production, replace with your preferred backend solution

class LocalStorageDB {
  constructor() {
    this.init();
  }

  init() {
    // Initialize with demo data if not exists
    if (!localStorage.getItem('users')) {
      const demoUsers = [
        {
          id: 'admin-1',
          uid: 'admin-1',
          email: 'admin@legalpartners.com',
          displayName: 'Admin User',
          role: 'admin',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'user-1',
          uid: 'user-1',
          email: 'client@example.com',
          displayName: 'John Client',
          role: 'user',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    if (!localStorage.getItem('policies')) {
      localStorage.setItem('policies', JSON.stringify([]));
    }

    if (!localStorage.getItem('claims')) {
      localStorage.setItem('claims', JSON.stringify([]));
    }

    if (!localStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  }

  // Generate unique ID
  generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
  }

  // Generic CRUD operations
  create(collection, data) {
    const items = this.getAll(collection);
    const newItem = {
      id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    localStorage.setItem(collection, JSON.stringify(items));
    return newItem;
  }

  getAll(collection) {
    const data = localStorage.getItem(collection);
    return data ? JSON.parse(data) : [];
  }

  getById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => item.id === id);
  }

  update(collection, id, data) {
    const items = this.getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(collection, JSON.stringify(items));
      return items[index];
    }
    return null;
  }

  delete(collection, id) {
    const items = this.getAll(collection);
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(collection, JSON.stringify(filteredItems));
    return true;
  }

  // Query operations
  where(collection, field, operator, value) {
    const items = this.getAll(collection);
    return items.filter(item => {
      switch (operator) {
        case '==':
          return item[field] === value;
        case '!=':
          return item[field] !== value;
        case '>':
          return item[field] > value;
        case '<':
          return item[field] < value;
        case '>=':
          return item[field] >= value;
        case '<=':
          return item[field] <= value;
        case 'array-contains':
          return Array.isArray(item[field]) && item[field].includes(value);
        default:
          return false;
      }
    });
  }

  // File storage simulation
  uploadFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: this.generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result, // Base64 data
          uploadedAt: new Date().toISOString()
        };
        
        // Store file data
        const files = JSON.parse(localStorage.getItem('files') || '[]');
        files.push(fileData);
        localStorage.setItem('files', JSON.stringify(files));
        
        resolve({
          id: fileData.id,
          name: fileData.name,
          url: `data:${file.type};base64,${e.target.result.split(',')[1]}`,
          type: file.type,
          size: file.size,
          uploadedAt: fileData.uploadedAt
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Authentication simulation
  getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  clearCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  // Password hashing simulation (NOT secure - for demo only)
  hashPassword(password) {
    // Simple hash for demo - use proper hashing in production
    return btoa(password);
  }

  verifyPassword(password, hash) {
    return btoa(password) === hash;
  }
}

export const db = new LocalStorageDB();
export default db;