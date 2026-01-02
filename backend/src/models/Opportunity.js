const { pool } = require('../config/database');

class Opportunity {
  // Create a new opportunity (companies only)
  static async create({ company_id, title, description, requirements, slots, deadline, location, duration_months }) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO opportunities 
         (company_id, title, description, requirements, slots, deadline, location, duration_months, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) 
         RETURNING *`,
        [company_id, title, description, requirements, slots, deadline, location, duration_months]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all active opportunities (students view)
  static async findAllActive(limit = 20, offset = 0) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           o.*,
           c.company_name,
           c.industry,
           c.location as company_location,
           u.name as company_contact_name,
           u.email as company_contact_email,
           (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count
         FROM opportunities o
         JOIN companies c ON o.company_id = c.id
         JOIN users u ON c.user_id = u.id
         WHERE o.is_active = true AND o.deadline > CURRENT_DATE
         ORDER BY o.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get opportunities by company (company view)
  static async findByCompany(company_id, limit = 20, offset = 0) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           o.*,
           (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count,
           (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id AND status = 'pending') as pending_applications,
           (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id AND status = 'accepted') as accepted_applications
         FROM opportunities o
         WHERE o.company_id = $1
         ORDER BY o.created_at DESC
         LIMIT $2 OFFSET $3`,
        [company_id, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get single opportunity with details
  static async findById(id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           o.*,
           c.company_name,
           c.industry,
           c.location as company_location,
           c.description as company_description,
           c.website as company_website,
           u.name as company_contact_name,
           u.email as company_contact_email,
           (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count
         FROM opportunities o
         JOIN companies c ON o.company_id = c.id
         JOIN users u ON c.user_id = u.id
         WHERE o.id = $1`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Update opportunity (companies only)
  static async update(id, company_id, updates) {
    const client = await pool.connect();
    
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'id' && key !== 'company_id') {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id, company_id);
      const query = `
        UPDATE opportunities 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount} AND company_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await client.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Close/deactivate opportunity
  static async close(id, company_id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'UPDATE opportunities SET is_active = false WHERE id = $1 AND company_id = $2 RETURNING *',
        [id, company_id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Search opportunities
  static async search(searchTerm, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          o.*,
          c.company_name,
          c.industry,
          c.location as company_location,
          u.name as company_contact_name,
          (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count
        FROM opportunities o
        JOIN companies c ON o.company_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE o.is_active = true AND o.deadline > CURRENT_DATE
      `;
      
      const values = [];
      let paramCount = 1;

      // Add search term
      if (searchTerm) {
        query += ` AND (o.title ILIKE $${paramCount} OR o.description ILIKE $${paramCount} OR c.company_name ILIKE $${paramCount})`;
        values.push(`%${searchTerm}%`);
        paramCount++;
      }

      // Add filters
      if (filters.industry) {
        query += ` AND c.industry ILIKE $${paramCount}`;
        values.push(`%${filters.industry}%`);
        paramCount++;
      }

      if (filters.location) {
        query += ` AND (o.location ILIKE $${paramCount} OR c.location ILIKE $${paramCount})`;
        values.push(`%${filters.location}%`);
        paramCount++;
      }

      if (filters.duration_months) {
        query += ` AND o.duration_months = $${paramCount}`;
        values.push(filters.duration_months);
        paramCount++;
      }

      query += ' ORDER BY o.created_at DESC LIMIT 50';

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get opportunity statistics
  static async getStats() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_opportunities,
          COUNT(*) FILTER (WHERE is_active = true) as active_opportunities,
          COUNT(*) FILTER (WHERE deadline > CURRENT_DATE) as open_opportunities,
          AVG(slots) as avg_slots_per_opportunity,
          COUNT(DISTINCT company_id) as companies_with_opportunities
        FROM opportunities
      `);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Opportunity;