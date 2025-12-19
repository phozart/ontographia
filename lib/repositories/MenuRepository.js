/**
 * MenuRepository - Repository for menu configuration management
 *
 * Handles CRUD operations for menu items, sections, and user/admin configurations.
 *
 * @module lib/repositories/MenuRepository
 */

import { query } from '../db/postgres';
import { BaseRepository } from './BaseRepository';

/**
 * Repository for menu item operations
 */
class MenuItemRepository extends BaseRepository {
  constructor() {
    super('menu_items');
  }

  /**
   * Get all active menu items
   * @returns {Promise<Object[]>}
   */
  async getActiveItems() {
    return this.findAll({ is_active: true }, { orderBy: 'sort_order', orderDirection: 'ASC' });
  }

  /**
   * Get menu items by section
   * @param {string} section - Section key
   * @returns {Promise<Object[]>}
   */
  async getBySection(section) {
    return this.findAll(
      { default_section: section, is_active: true },
      { orderBy: 'sort_order', orderDirection: 'ASC' }
    );
  }

  /**
   * Get menu item by key
   * @param {string} key - Menu item key
   * @returns {Promise<Object|null>}
   */
  async getByKey(key) {
    return this.findOne({ key });
  }

  /**
   * Update menu item by key
   * @param {string} key - Menu item key
   * @param {Object} data - Data to update
   * @returns {Promise<Object|null>}
   */
  async updateByKey(key, data) {
    const item = await this.getByKey(key);
    if (!item) return null;
    return this.update(item.id, data);
  }
}

/**
 * Repository for menu section operations
 */
class MenuSectionRepository extends BaseRepository {
  constructor() {
    super('menu_sections');
  }

  /**
   * Get all sections ordered by sort_order
   * @returns {Promise<Object[]>}
   */
  async getAll() {
    return this.findAll({}, { orderBy: 'sort_order', orderDirection: 'ASC' });
  }

  /**
   * Get section by key
   * @param {string} key - Section key
   * @returns {Promise<Object|null>}
   */
  async getByKey(key) {
    return this.findOne({ key });
  }
}

/**
 * Repository for default menu configuration (admin-managed)
 */
class MenuConfigDefaultRepository extends BaseRepository {
  constructor() {
    super('menu_config_default');
  }

  /**
   * Get the active default configuration
   * @returns {Promise<Object|null>}
   */
  async getActiveConfig() {
    return this.findOne({ is_active: true });
  }

  /**
   * Get the current version number
   * @returns {Promise<number>}
   */
  async getCurrentVersion() {
    const result = await query(`
      SELECT COALESCE(MAX(version), 0) as max_version
      FROM menu_config_default
    `);
    return result.rows[0]?.max_version || 0;
  }

  /**
   * Create a new default configuration (deactivates previous)
   * @param {Object} config - The configuration object
   * @param {string} createdBy - User ID who created this config
   * @returns {Promise<Object>}
   */
  async createNewVersion(config, createdBy) {
    // Deactivate all existing configs
    await query(`UPDATE menu_config_default SET is_active = false`);

    // Get next version number
    const currentVersion = await this.getCurrentVersion();
    const newVersion = currentVersion + 1;

    // Create new config
    return this.create({
      version: newVersion,
      config: JSON.stringify(config),
      is_active: true,
      created_by: createdBy,
    });
  }

  /**
   * Update the active configuration in place
   * @param {Object} config - The configuration object
   * @returns {Promise<Object|null>}
   */
  async updateActiveConfig(config) {
    const active = await this.getActiveConfig();
    if (!active) return null;
    return this.update(active.id, { config: JSON.stringify(config) });
  }
}

/**
 * Repository for user menu configurations (personal overrides)
 */
class MenuConfigUserRepository extends BaseRepository {
  constructor() {
    super('menu_config_user');
  }

  /**
   * Get a user's personal configuration
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getUserConfig(userId) {
    return this.findOne({ user_id: userId });
  }

  /**
   * Save or update a user's personal configuration
   * @param {string} userId - User ID
   * @param {Object} config - The configuration object
   * @param {number} basedOnVersion - Default config version this is based on
   * @returns {Promise<Object>}
   */
  async saveUserConfig(userId, config, basedOnVersion) {
    const existing = await this.getUserConfig(userId);

    if (existing) {
      return this.update(existing.id, {
        config: JSON.stringify(config),
        based_on_version: basedOnVersion,
      });
    }

    return this.create({
      user_id: userId,
      config: JSON.stringify(config),
      based_on_version: basedOnVersion,
    });
  }

  /**
   * Delete a user's personal configuration (resets to default)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async deleteUserConfig(userId) {
    const existing = await this.getUserConfig(userId);
    if (!existing) return false;
    return this.delete(existing.id);
  }
}

/**
 * Main Menu Repository - Facade for all menu-related operations
 */
export class MenuRepository {
  constructor() {
    this.items = new MenuItemRepository();
    this.sections = new MenuSectionRepository();
    this.defaultConfig = new MenuConfigDefaultRepository();
    this.userConfig = new MenuConfigUserRepository();
  }

  /**
   * Get all menu items
   * @returns {Promise<Object[]>}
   */
  async getMenuItems() {
    return this.items.getActiveItems();
  }

  /**
   * Get all menu sections
   * @returns {Promise<Object[]>}
   */
  async getMenuSections() {
    return this.sections.getAll();
  }

  /**
   * Get the default menu configuration
   * @returns {Promise<Object|null>}
   */
  async getDefaultConfig() {
    const config = await this.defaultConfig.getActiveConfig();
    if (config && typeof config.config === 'string') {
      config.config = JSON.parse(config.config);
    }
    return config;
  }

  /**
   * Get effective configuration for a user
   * Returns user's personal config if exists, otherwise default
   * @param {string} userId - User ID
   * @returns {Promise<{config: Object, isPersonal: boolean, version: number}>}
   */
  async getEffectiveConfig(userId) {
    // Try to get user's personal config first
    const userConfig = await this.userConfig.getUserConfig(userId);
    if (userConfig) {
      return {
        config: typeof userConfig.config === 'string'
          ? JSON.parse(userConfig.config)
          : userConfig.config,
        isPersonal: true,
        version: userConfig.based_on_version || 0,
      };
    }

    // Fall back to default config
    const defaultConfig = await this.getDefaultConfig();
    return {
      config: defaultConfig?.config || { sections: [] },
      isPersonal: false,
      version: defaultConfig?.version || 0,
    };
  }

  /**
   * Save a user's personal menu configuration
   * @param {string} userId - User ID
   * @param {Object} config - The configuration object
   * @returns {Promise<Object>}
   */
  async saveUserConfig(userId, config) {
    const currentVersion = await this.defaultConfig.getCurrentVersion();
    const result = await this.userConfig.saveUserConfig(userId, config, currentVersion);
    if (result && typeof result.config === 'string') {
      result.config = JSON.parse(result.config);
    }
    return result;
  }

  /**
   * Reset a user's personal configuration to default
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async resetUserConfig(userId) {
    return this.userConfig.deleteUserConfig(userId);
  }

  /**
   * Update the default menu configuration (admin only)
   * @param {Object} config - The configuration object
   * @param {string} createdBy - Admin user ID
   * @param {boolean} createNewVersion - If true, creates new version; otherwise updates in place
   * @returns {Promise<Object>}
   */
  async updateDefaultConfig(config, createdBy, createNewVersion = false) {
    let result;
    if (createNewVersion) {
      result = await this.defaultConfig.createNewVersion(config, createdBy);
    } else {
      result = await this.defaultConfig.updateActiveConfig(config);
    }
    if (result && typeof result.config === 'string') {
      result.config = JSON.parse(result.config);
    }
    return result;
  }

  /**
   * Create or update a menu item (admin only)
   * @param {string} key - Menu item key
   * @param {Object} data - Menu item data
   * @returns {Promise<Object>}
   */
  async upsertMenuItem(key, data) {
    const existing = await this.items.getByKey(key);
    if (existing) {
      return this.items.update(existing.id, data);
    }
    return this.items.create({ key, ...data });
  }

  /**
   * Delete a menu item (admin only)
   * @param {string} key - Menu item key
   * @returns {Promise<boolean>}
   */
  async deleteMenuItem(key) {
    const existing = await this.items.getByKey(key);
    if (!existing) return false;
    return this.items.delete(existing.id);
  }

  /**
   * Create or update a menu section (admin only)
   * @param {string} key - Section key
   * @param {Object} data - Section data
   * @returns {Promise<Object>}
   */
  async upsertSection(key, data) {
    const existing = await this.sections.getByKey(key);
    if (existing) {
      // Don't allow updating system sections' key
      const updateData = { ...data };
      if (existing.is_system) {
        delete updateData.key;
      }
      return this.sections.update(existing.id, updateData);
    }
    return this.sections.create({ key, ...data });
  }

  /**
   * Delete a menu section (admin only, non-system sections)
   * @param {string} key - Section key
   * @returns {Promise<boolean>}
   */
  async deleteSection(key) {
    const existing = await this.sections.getByKey(key);
    if (!existing || existing.is_system) return false;
    return this.sections.delete(existing.id);
  }
}

// Export singleton instance
export const menuRepository = new MenuRepository();

export default MenuRepository;
