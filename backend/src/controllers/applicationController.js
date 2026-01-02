const Application = require('../models/Application');

// Create new application (students only)
const createApplication = async (req, res) => {
  try {
    const { opportunity_id, cover_letter } = req.body;
    const student_id = req.user.student_id; // Set by middleware after verifying student role

    // Validation
    if (!opportunity_id) {
      return res.status(400).json({
        message: 'Opportunity ID is required'
      });
    }

    if (!cover_letter || cover_letter.trim().length < 50) {
      return res.status(400).json({
        message: 'Cover letter is required and must be at least 50 characters long'
      });
    }

    const application = await Application.create({
      student_id,
      opportunity_id: parseInt(opportunity_id),
      cover_letter: cover_letter.trim()
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    console.error('Create application error:', error);
    
    // Handle specific error messages
    if (error.message.includes('already applied') || 
        error.message.includes('no longer active') || 
        error.message.includes('deadline has passed') ||
        error.message.includes('not found')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get student's applications (students only)
const getStudentApplications = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const applications = await Application.findByStudent(student_id, limit, offset);

    res.json({
      message: 'Student applications retrieved successfully',
      applications,
      pagination: {
        page,
        limit,
        total: applications.length
      }
    });

  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({
      message: 'Failed to retrieve applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get applications for an opportunity (companies only)
const getOpportunityApplications = async (req, res) => {
  try {
    const { opportunity_id } = req.params;
    const company_id = req.user.company_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!opportunity_id || isNaN(opportunity_id)) {
      return res.status(400).json({
        message: 'Valid opportunity ID is required'
      });
    }

    const applications = await Application.findByOpportunity(
      parseInt(opportunity_id), 
      company_id, 
      limit, 
      offset
    );

    res.json({
      message: 'Opportunity applications retrieved successfully',
      applications,
      pagination: {
        page,
        limit,
        total: applications.length
      }
    });

  } catch (error) {
    console.error('Get opportunity applications error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Failed to retrieve applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update application status (companies only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id, opportunity_id } = req.params;
    const { status } = req.body;
    const company_id = req.user.company_id;

    // Validation
    if (!application_id || isNaN(application_id)) {
      return res.status(400).json({
        message: 'Valid application ID is required'
      });
    }

    if (!opportunity_id || isNaN(opportunity_id)) {
      return res.status(400).json({
        message: 'Valid opportunity ID is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        message: 'Status is required',
        validStatuses: ['pending', 'accepted', 'rejected', 'placed']
      });
    }

    const application = await Application.updateStatus(
      parseInt(application_id),
      parseInt(opportunity_id),
      company_id,
      status
    );

    if (!application) {
      return res.status(404).json({
        message: 'Application not found or access denied'
      });
    }

    res.json({
      message: `Application ${status} successfully`,
      application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('access denied') ||
        error.message.includes('Invalid status')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Failed to update application status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single application details
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid application ID is required'
      });
    }

    const application = await Application.findById(parseInt(id));

    if (!application) {
      return res.status(404).json({
        message: 'Application not found'
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (userRole === 'student' && application.student_id !== req.user.student_id) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    if (userRole === 'company' && application.company_id !== req.user.company_id) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({
      message: 'Application retrieved successfully',
      application
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      message: 'Failed to retrieve application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Withdraw application (students only)
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user.student_id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid application ID is required'
      });
    }

    const application = await Application.withdraw(parseInt(id), student_id);

    if (!application) {
      return res.status(404).json({
        message: 'Application not found or cannot be withdrawn'
      });
    }

    res.json({
      message: 'Application withdrawn successfully',
      application
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('Cannot withdraw')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Failed to withdraw application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get applications by status for a company (companies only)
const getCompanyApplicationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const company_id = req.user.company_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const validStatuses = ['pending', 'accepted', 'rejected', 'placed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses
      });
    }

    const applications = await Application.findByCompanyAndStatus(
      company_id, 
      status, 
      limit, 
      offset
    );

    res.json({
      message: `${status} applications retrieved successfully`,
      applications,
      status,
      pagination: {
        page,
        limit,
        total: applications.length
      }
    });

  } catch (error) {
    console.error('Get company applications by status error:', error);
    res.status(500).json({
      message: 'Failed to retrieve applications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get application statistics (admin only)
const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.getStats();

    res.json({
      message: 'Application statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      message: 'Failed to retrieve application statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createApplication,
  getStudentApplications,
  getOpportunityApplications,
  updateApplicationStatus,
  getApplicationById,
  withdrawApplication,
  getCompanyApplicationsByStatus,
  getApplicationStats
};