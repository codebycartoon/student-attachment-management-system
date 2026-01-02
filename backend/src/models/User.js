const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create({ name, email, password, role }) {
    const client = await pool.connect();
    
    try {
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert user
      const result = await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
        [name, email, hashedPassword, role]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Find user by ID
  static async findById(id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const client = await pool.connect();
    
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${paramCount} 
        RETURNING id, name, email, role, updated_at
      `;

      const result = await client.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete user
  static async delete(id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all users (admin only)
  static async findAll(limit = 50, offset = 0) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Count users by role
  static async countByRole() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM users 
        GROUP BY role
      `);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = User;