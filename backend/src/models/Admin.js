const { pool } = require('../config/database');

class Admin {
  // Get comprehensive system statistics
  static async getSystemStats() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          -- User Statistics
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
          (SELECT COUNT(*) FROM users WHERE role = 'company') as total_companies,
          (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
          (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30_days,
          
          -- Opportunity Statistics
          (SELECT COUNT(*) FROM opportunities) as total_opportunities,
          (SELECT COUNT(*) FROM opportunities WHERE is_active = true) as active_opportunities,
          (SELECT COUNT(*) FROM opportunities WHERE deadline > CURRENT_DATE) as open_opportunities,
          (SELECT COUNT(*) FROM opportunities WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_opportunities_30_days,
          (SELECT AVG(slots) FROM opportunities) as avg_slots_per_opportunity,
          
          -- Application Statistics
          (SELECT COUNT(*) FROM applications) as total_applications,
          (SELECT COUNT(*) FROM applications WHERE status = 'pending') as pending_applications,
          (SELECT COUNT(*) FROM applications WHERE status = 'accepted') as accepted_applications,
          (SELECT COUNT(*) FROM applications WHERE status = 'rejected') as rejected_applications,
          (SELECT COUNT(*) FROM applications WHERE status = 'placed') as placed_applications,
          (SELECT COUNT(*) FROM applications WHERE applied_at >= CURRENT_DATE - INTERVAL '30 days') as new_applications_30_days,
          
          -- Success Rates
          CASE 
            WHEN (SELECT COUNT(*) FROM applications) > 0 
            THEN ROUND((SELECT COUNT(*) FROM applications WHERE status = 'accepted')::numeric / (SELECT COUNT(*) FROM applications)::numeric * 100, 2)
            ELSE 0 
          END as acceptance_rate,
          
          CASE 
            WHEN (SELECT COUNT(*) FROM applications WHERE status = 'accepted') > 0 
            THEN ROUND((SELECT COUNT(*) FROM applications WHERE status = 'placed')::numeric / (SELECT COUNT(*) FROM applications WHERE status = 'accepted')::numeric * 100, 2)
            ELSE 0 
          END as placement_rate
      `);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user activity over time
  static async getUserActivityStats(days = 30) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE role = 'student') as students_registered,
          COUNT(*) FILTER (WHERE role = 'company') as companies_registered,
          COUNT(*) as total_registrations
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get application trends
  static async getApplicationTrends(days = 30) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          DATE(applied_at) as date,
          COUNT(*) as applications_submitted,
          COUNT(*) FILTER (WHERE status = 'accepted') as applications_accepted,
          COUNT(*) FILTER (WHERE status = 'rejected') as applications_rejected
        FROM applications 
        WHERE applied_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(applied_at)
        ORDER BY date DESC
      `);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get top performing companies
  static async getTopCompanies(limit = 10) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          c.company_name,
          c.industry,
          c.location,
          u.email,
          COUNT(o.id) as total_opportunities,
          COUNT(a.id) as total_applications,
          COUNT(a.id) FILTER (WHERE a.status = 'accepted') as accepted_applications,
          COUNT(a.id) FILTER (WHERE a.status = 'placed') as placed_students,
          CASE 
            WHEN COUNT(a.id) > 0 
            THEN ROUND(COUNT(a.id) FILTER (WHERE a.status = 'accepted')::numeric / COUNT(a.id)::numeric * 100, 2)
            ELSE 0 
          END as acceptance_rate
        FROM companies c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN opportunities o ON c.id = o.company_id
        LEFT JOIN applications a ON o.id = a.opportunity_id
        GROUP BY c.id, c.company_name, c.industry, c.location, u.email
        HAVING COUNT(o.id) > 0
        ORDER BY placed_students DESC, acceptance_rate DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get industry analytics
  static async getIndustryAnalytics() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          c.industry,
          COUNT(DISTINCT c.id) as companies_count,
          COUNT(o.id) as opportunities_count,
          COUNT(a.id) as applications_count,
          COUNT(a.id) FILTER (WHERE a.status = 'placed') as placements_count,
          AVG(o.slots) as avg_slots_per_opportunity,
          CASE 
            WHEN COUNT(a.id) > 0 
            THEN ROUND(COUNT(a.id) FILTER (WHERE a.status = 'placed')::numeric / COUNT(a.id)::numeric * 100, 2)
            ELSE 0 
          END as placement_rate
        FROM companies c
        LEFT JOIN opportunities o ON c.id = o.company_id
        LEFT JOIN applications a ON o.id = a.opportunity_id
        WHERE c.industry IS NOT NULL
        GROUP BY c.industry
        ORDER BY placements_count DESC, opportunities_count DESC
      `);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get location analytics
  static async getLocationAnalytics() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          COALESCE(o.location, c.location) as location,
          COUNT(DISTINCT c.id) as companies_count,
          COUNT(o.id) as opportunities_count,
          COUNT(a.id) as applications_count,
          COUNT(a.id) FILTER (WHERE a.status = 'placed') as placements_count
        FROM companies c
        LEFT JOIN opportunities o ON c.id = o.company_id
        LEFT JOIN applications a ON o.id = a.opportunity_id
        WHERE COALESCE(o.location, c.location) IS NOT NULL
        GROUP BY COALESCE(o.location, c.location)
        ORDER BY placements_count DESC, opportunities_count DESC
      `);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get student performance analytics
  static async getStudentAnalytics(limit = 10) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          u.name as student_name,
          u.email,
          s.registration_number,
          s.course,
          s.year,
          COUNT(a.id) as total_applications,
          COUNT(a.id) FILTER (WHERE a.status = 'accepted') as accepted_applications,
          COUNT(a.id) FILTER (WHERE a.status = 'placed') as placements,
          CASE 
            WHEN COUNT(a.id) > 0 
            THEN ROUND(COUNT(a.id) FILTER (WHERE a.status = 'accepted')::numeric / COUNT(a.id)::numeric * 100, 2)
            ELSE 0 
          END as success_rate
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN applications a ON s.id = a.student_id
        GROUP BY s.id, u.name, u.email, s.registration_number, s.course, s.year
        HAVING COUNT(a.id) > 0
        ORDER BY placements DESC, success_rate DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all users with detailed information for management
  static async getAllUsers(filters = {}, limit = 50, offset = 0) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.created_at,
          CASE 
            WHEN u.role = 'student' THEN s.registration_number
            WHEN u.role = 'company' THEN c.company_name
            ELSE NULL
          END as additional_info,
          CASE 
            WHEN u.role = 'student' THEN s.course
            WHEN u.role = 'company' THEN c.industry
            ELSE NULL
          END as secondary_info,
          CASE 
            WHEN u.role = 'student' THEN (SELECT COUNT(*) FROM applications WHERE student_id = s.id)
            WHEN u.role = 'company' THEN (SELECT COUNT(*) FROM opportunities WHERE company_id = c.id)
            ELSE 0
          END as activity_count
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        LEFT JOIN companies c ON u.id = c.user_id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 1;

      if (filters.role) {
        query += ` AND u.role = $${paramCount}`;
        values.push(filters.role);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        values.push(`%${filters.search}%`);
        paramCount++;
      }

      query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(limit, offset);

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get system health metrics
  static async getSystemHealth() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          -- Database health
          (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections,
          
          -- Recent activity
          (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours') as new_users_24h,
          (SELECT COUNT(*) FROM applications WHERE applied_at >= NOW() - INTERVAL '24 hours') as new_applications_24h,
          (SELECT COUNT(*) FROM opportunities WHERE created_at >= NOW() - INTERVAL '24 hours') as new_opportunities_24h,
          
          -- Data integrity
          (SELECT COUNT(*) FROM users WHERE email IS NULL OR email = '') as users_missing_email,
          (SELECT COUNT(*) FROM opportunities WHERE deadline < CURRENT_DATE AND is_active = true) as expired_active_opportunities,
          (SELECT COUNT(*) FROM applications WHERE status NOT IN ('pending', 'accepted', 'rejected', 'placed')) as invalid_application_status
      `);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Export data for reporting
  static async exportData(type, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query;
      let values = [];

      switch (type) {
        case 'users':
          query = `
            SELECT 
              u.id, u.name, u.email, u.role, u.created_at,
              CASE WHEN u.role = 'student' THEN s.registration_number ELSE c.company_name END as identifier
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN companies c ON u.id = c.user_id
            ORDER BY u.created_at DESC
          `;
          break;
          
        case 'applications':
          query = `
            SELECT 
              a.id, a.status, a.applied_at,
              u.name as student_name, st.registration_number,
              o.title as opportunity_title, c.company_name
            FROM applications a
            JOIN students st ON a.student_id = st.id
            JOIN users u ON st.user_id = u.id
            JOIN opportunities o ON a.opportunity_id = o.id
            JOIN companies c ON o.company_id = c.id
            ORDER BY a.applied_at DESC
          `;
          break;
          
        case 'opportunities':
          query = `
            SELECT 
              o.id, o.title, o.description, o.slots, o.deadline, o.location, o.is_active, o.created_at,
              c.company_name, c.industry,
              (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count
            FROM opportunities o
            JOIN companies c ON o.company_id = c.id
            ORDER BY o.created_at DESC
          `;
          break;
          
        default:
          throw new Error('Invalid export type');
      }

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Admin;