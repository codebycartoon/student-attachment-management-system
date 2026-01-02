const { pool } = require('../config/database');

class Application {
  // Create a new application (students only)
  static async create({ student_id, opportunity_id, cover_letter }) {
    const client = await pool.connect();
    
    try {
      // Check if student already applied for this opportunity
      const existingApplication = await client.query(
        'SELECT id FROM applications WHERE student_id = $1 AND opportunity_id = $2',
        [student_id, opportunity_id]
      );

      if (existingApplication.rows.length > 0) {
        throw new Error('You have already applied for this opportunity');
      }

      // Check if opportunity is still active and open
      const opportunity = await client.query(
        'SELECT id, is_active, deadline FROM opportunities WHERE id = $1',
        [opportunity_id]
      );

      if (!opportunity.rows[0]) {
        throw new Error('Opportunity not found');
      }

      if (!opportunity.rows[0].is_active) {
        throw new Error('This opportunity is no longer active');
      }

      if (new Date(opportunity.rows[0].deadline) < new Date()) {
        throw new Error('Application deadline has passed');
      }

      // Create application
      const result = await client.query(
        `INSERT INTO applications (student_id, opportunity_id, cover_letter, status) 
         VALUES ($1, $2, $3, 'pending') 
         RETURNING *`,
        [student_id, opportunity_id, cover_letter]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get applications by student
  static async findByStudent(student_id, limit = 20, offset = 0) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           a.*,
           o.title as opportunity_title,
           o.description as opportunity_description,
           o.deadline,
           o.location,
           o.duration_months,
           c.company_name,
           c.industry,
           u.name as company_contact_name,
           u.email as company_contact_email
         FROM applications a
         JOIN opportunities o ON a.opportunity_id = o.id
         JOIN companies c ON o.company_id = c.id
         JOIN users u ON c.user_id = u.id
         WHERE a.student_id = $1
         ORDER BY a.applied_at DESC
         LIMIT $2 OFFSET $3`,
        [student_id, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get applications for an opportunity (companies only)
  static async findByOpportunity(opportunity_id, company_id, limit = 20, offset = 0) {
    const client = await pool.connect();
    
    try {
      // Verify company owns this opportunity
      const opportunityCheck = await client.query(
        'SELECT id FROM opportunities WHERE id = $1 AND company_id = $2',
        [opportunity_id, company_id]
      );

      if (!opportunityCheck.rows[0]) {
        throw new Error('Opportunity not found or access denied');
      }

      const result = await client.query(
        `SELECT 
           a.*,
           s.registration_number,
           s.course,
           s.year,
           s.phone,
           u.name as student_name,
           u.email as student_email
         FROM applications a
         JOIN students s ON a.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE a.opportunity_id = $1
         ORDER BY a.applied_at DESC
         LIMIT $2 OFFSET $3`,
        [opportunity_id, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Update application status (companies only)
  static async updateStatus(application_id, opportunity_id, company_id, status) {
    const client = await pool.connect();
    
    try {
      // Verify company owns this opportunity
      const opportunityCheck = await client.query(
        'SELECT id FROM opportunities WHERE id = $1 AND company_id = $2',
        [opportunity_id, company_id]
      );

      if (!opportunityCheck.rows[0]) {
        throw new Error('Opportunity not found or access denied');
      }

      // Validate status
      const validStatuses = ['pending', 'accepted', 'rejected', 'placed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const result = await client.query(
        `UPDATE applications 
         SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND opportunity_id = $3
         RETURNING *`,
        [status, application_id, opportunity_id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get single application with full details
  static async findById(id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           a.*,
           o.title as opportunity_title,
           o.description as opportunity_description,
           o.deadline,
           o.location,
           o.duration_months,
           c.company_name,
           c.industry,
           c.location as company_location,
           s.registration_number,
           s.course,
           s.year,
           s.phone,
           u.name as student_name,
           u.email as student_email,
           cu.name as company_contact_name,
           cu.email as company_contact_email
         FROM applications a
         JOIN opportunities o ON a.opportunity_id = o.id
         JOIN companies c ON o.company_id = c.id
         JOIN students s ON a.student_id = s.id
         JOIN users u ON s.user_id = u.id
         JOIN users cu ON c.user_id = cu.id
         WHERE a.id = $1`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Withdraw application (students only)
  static async withdraw(id, student_id) {
    const client = await pool.connect();
    
    try {
      // Check if application exists and belongs to student
      const application = await client.query(
        'SELECT id, status FROM applications WHERE id = $1 AND student_id = $2',
        [id, student_id]
      );

      if (!application.rows[0]) {
        throw new Error('Application not found');
      }

      if (application.rows[0].status !== 'pending') {
        throw new Error('Cannot withdraw application that has already been processed');
      }

      const result = await client.query(
        'DELETE FROM applications WHERE id = $1 AND student_id = $2 RETURNING *',
        [id, student_id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get application statistics
  static async getStats() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_applications,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
          COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications,
          COUNT(*) FILTER (WHERE status = 'placed') as placed_applications,
          COUNT(DISTINCT student_id) as students_with_applications,
          COUNT(DISTINCT opportunity_id) as opportunities_with_applications
        FROM applications
      `);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // Get applications by status for a company
  static async findByCompanyAndStatus(company_id, status, limit = 20, offset = 0) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           a.*,
           o.title as opportunity_title,
           s.registration_number,
           s.course,
           s.year,
           u.name as student_name,
           u.email as student_email
         FROM applications a
         JOIN opportunities o ON a.opportunity_id = o.id
         JOIN students s ON a.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE o.company_id = $1 AND a.status = $2
         ORDER BY a.applied_at DESC
         LIMIT $3 OFFSET $4`,
        [company_id, status, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Application;