/**
 * Adapter Pattern Implementation for Database Operations
 * Structural Design Pattern
 */

// Database Interface (Target Interface)
class DatabaseInterface {
  async connect() {
    throw new Error('connect method must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect method must be implemented');
  }

  async find(table, query) {
    throw new Error('find method must be implemented');
  }

  async create(table, data) {
    throw new Error('create method must be implemented');
  }

  async update(table, id, data) {
    throw new Error('update method must be implemented');
  }

  async delete(table, id) {
    throw new Error('delete method must be implemented');
  }
}

// Supabase Adapter
class SupabaseAdapter extends DatabaseInterface {
  constructor(supabaseClient) {
    super();
    this.client = supabaseClient;
    this.connected = false;
  }

  async connect() {
    try {
      // Test connection
      const { data, error } = await this.client.from('users').select('count').limit(1);
      this.connected = !error;
      return this.connected;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  async disconnect() {
    this.connected = false;
  }

  async find(table, query = {}) {
    try {
      let dbQuery = this.client.from(table);

      // Apply filters
      if (query.where) {
        Object.entries(query.where).forEach(([key, value]) => {
          dbQuery = dbQuery.eq(key, value);
        });
      }

      // Apply ordering
      if (query.orderBy) {
        dbQuery = dbQuery.order(query.orderBy.column, { ascending: query.orderBy.ascending !== false });
      }

      // Apply limit
      if (query.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }

      // Apply offset
      if (query.offset) {
        dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);
      }

      const { data, error } = await dbQuery.select('*');
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async create(table, data) {
    try {
      const { data: result, error } = await this.client.from(table).insert([data]).select();
      
      if (error) throw error;
      return { success: true, data: result[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(table, id, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return { success: true, data: result[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(table, id) {
    try {
      const { error } = await this.client.from(table).delete().eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Supabase-specific methods
  async auth() {
    return this.client.auth;
  }

  async storage() {
    return this.client.storage;
  }
}

// Local Storage Adapter (for development/fallback)
class LocalStorageAdapter extends DatabaseInterface {
  constructor() {
    super();
    this.connected = true;
  }

  async connect() {
    return true;
  }

  async disconnect() {
    return true;
  }

  async find(table, query = {}) {
    try {
      let data = JSON.parse(localStorage.getItem(table) || '[]');

      // Apply filters
      if (query.where) {
        data = data.filter(item => {
          return Object.entries(query.where).every(([key, value]) => item[key] === value);
        });
      }

      // Apply sorting
      if (query.orderBy) {
        data.sort((a, b) => {
          const aVal = a[query.orderBy.column];
          const bVal = b[query.orderBy.column];
          const ascending = query.orderBy.ascending !== false;
          
          if (aVal < bVal) return ascending ? -1 : 1;
          if (aVal > bVal) return ascending ? 1 : -1;
          return 0;
        });
      }

      // Apply limit and offset
      if (query.offset || query.limit) {
        const start = query.offset || 0;
        const end = start + (query.limit || data.length);
        data = data.slice(start, end);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async create(table, data) {
    try {
      const items = JSON.parse(localStorage.getItem(table) || '[]');
      const newItem = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
      items.push(newItem);
      localStorage.setItem(table, JSON.stringify(items));
      return { success: true, data: newItem };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(table, id, data) {
    try {
      const items = JSON.parse(localStorage.getItem(table) || '[]');
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return { success: false, error: 'Item not found' };
      }

      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(table, JSON.stringify(items));
      return { success: true, data: items[index] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(table, id) {
    try {
      const items = JSON.parse(localStorage.getItem(table) || '[]');
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return { success: false, error: 'Item not found' };
      }

      items.splice(index, 1);
      localStorage.setItem(table, JSON.stringify(items));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Database Adapter Factory
class DatabaseAdapterFactory {
  static createAdapter(type, config = {}) {
    switch (type) {
      case 'supabase':
        if (!config.client) {
          throw new Error('Supabase client is required');
        }
        return new SupabaseAdapter(config.client);

      case 'localStorage':
        return new LocalStorageAdapter();

      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  static createSupabaseAdapter(supabaseClient) {
    return this.createAdapter('supabase', { client: supabaseClient });
  }

  static createLocalStorageAdapter() {
    return this.createAdapter('localStorage');
  }
}

// Database Manager (Singleton)
class DatabaseManager {
  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }
    this.adapters = new Map();
    this.defaultAdapter = null;
    DatabaseManager.instance = this;
  }

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  addAdapter(name, adapter) {
    this.adapters.set(name, adapter);
  }

  setDefaultAdapter(name) {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Adapter '${name}' not found`);
    }
    this.defaultAdapter = adapter;
  }

  getAdapter(name) {
    return this.adapters.get(name) || this.defaultAdapter;
  }

  async initialize() {
    const promises = Array.from(this.adapters.values()).map(adapter => adapter.connect());
    const results = await Promise.allSettled(promises);
    
    return results.every(result => result.status === 'fulfilled' && result.value);
  }
}

export {
  DatabaseInterface,
  SupabaseAdapter,
  LocalStorageAdapter,
  DatabaseAdapterFactory,
  DatabaseManager
};
