const Admin = require('../models/Admin');
const User = require('../models/User');

// Get comprehensive dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const stats = await Admin.getSystemStats();
    
    res.json({
      message: 'Dashboard statistics retrieved successfully',
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Failed to retrieve dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user activity analytics
const getUserActivity = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    if (days < 1 || days > 365) {
      return res.status(400).json({
        message: 'Days parameter must be between 1 and 365'
      });
    }

    const activity = await Admin.getUserActivityStats(days);
    
    res.json({
      message: 'User activity statistics retrieved successfully',
      activity,
      period: `${days} days`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      message: 'Failed to retrieve user activity statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get application trends
const getApplicationTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    if (days < 1 || days > 365) {
      return res.status(400).json({
        message: 'Days parameter must be between 1 and 365'
      });
    }

    const trends = await Admin.getApplicationTrends(days);
    
    res.json({
      message: 'Application trends retrieved successfully',
      trends,
      period: `${days} days`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get application trends error:', error);
    res.status(500).json({
      message: 'Failed to retrieve application trends',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get top performing companies
const getTopCompanies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        message: 'Limit parameter must be between 1 and 100'
      });
    }

    const companies = await Admin.getTopCompanies(limit);
    
    res.json({
      message: 'Top companies retrieved successfully',
      companies,
      count: companies.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get top companies error:', error);
    res.status(500).json({
      message: 'Failed to retrieve top companies',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get industry analytics
const getIndustryAnalytics = async (req, res) => {
  try {
    const analytics = await Admin.getIndustryAnalytics();
    
    res.json({
      message: 'Industry analytics retrieved successfully',
      analytics,
      count: analytics.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get industry analytics error:', error);
    res.status(500).json({
      message: 'Failed to retrieve industry analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get location analytics
const getLocationAnalytics = async (req, res) => {
  try {
    const analytics = await Admin.getLocationAnalytics();
    
    res.json({
      message: 'Location analytics retrieved successfully',
      analytics,
      count: analytics.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get location analytics error:', error);
    res.status(500).json({
      message: 'Failed to retrieve location analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get student performance analytics
const getStudentAnalytics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        message: 'Limit parameter must be between 1 and 100'
      });
    }

    const students = await Admin.getStudentAnalytics(limit);
    
    res.json({
      message: 'Student analytics retrieved successfully',
      students,
      count: students.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({
      message: 'Failed to retrieve student analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all users for management
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.search) filters.search = req.query.search;

    const users = await Admin.getAllUsers(filters, limit, offset);
    
    res.json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        page,
        limit,
        total: users.length
      },
      filters,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get system health metrics
const getSystemHealth = async (req, res) => {
  try {
    const health = await Admin.getSystemHealth();
    
    // Determine overall system status
    const issues = [];
    if (parseInt(health.users_missing_email) > 0) {
      issues.push(`${health.users_missing_email} users missing email`);
    }
    if (parseInt(health.expired_active_opportunities) > 0) {
      issues.push(`${health.expired_active_opportunities} expired opportunities still active`);
    }
    if (parseInt(health.invalid_application_status) > 0) {
      issues.push(`${health.invalid_application_status} applications with invalid status`);
    }

    const status = issues.length === 0 ? 'healthy' : 'warning';
    
    res.json({
      message: 'System health retrieved successfully',
      health: {
        ...health,
        status,
        issues: issues.length > 0 ? issues : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      message: 'Failed to retrieve system health',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Export data for reporting
const exportData = async (req, res) => {
  try {
    const { type } = req.params;
    const format = req.query.format || 'json';
    
    const validTypes = ['users', 'applications', 'opportunities'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid export type',
        validTypes
      });
    }

    const validFormats = ['json', 'csv'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        message: 'Invalid format',
        validFormats
      });
    }

    const data = await Admin.exportData(type);
    
    if (format === 'csv') {
      // Convert to CSV format
      if (data.length === 0) {
        return res.status(404).json({
          message: 'No data found for export'
        });
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      res.json({
        message: `${type} data exported successfully`,
        data,
        count: data.length,
        exportedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      message: 'Failed to export data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        message: 'Valid user ID is required'
      });
    }

    const validActions = ['activate', 'deactivate', 'delete'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        message: 'Invalid action',
        validActions
      });
    }

    // Check if user exists
    const user = await User.findById(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from modifying other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Cannot modify admin users'
      });
    }

    let result;
    switch (action) {
      case 'delete':
        result = await User.delete(parseInt(userId));
        break;
      default:
        return res.status(400).json({
          message: 'Action not implemented yet'
        });
    }

    res.json({
      message: `User ${action}d successfully`,
      user: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get comprehensive analytics summary
const getAnalyticsSummary = async (req, res) => {
  try {
    const [
      systemStats,
      industryAnalytics,
      locationAnalytics,
      topCompanies
    ] = await Promise.all([
      Admin.getSystemStats(),
      Admin.getIndustryAnalytics(),
      Admin.getLocationAnalytics(),
      Admin.getTopCompanies(5)
    ]);

    res.json({
      message: 'Analytics summary retrieved successfully',
      summary: {
        systemStats,
        industryAnalytics: industryAnalytics.slice(0, 5), // Top 5 industries
        locationAnalytics: locationAnalytics.slice(0, 5), // Top 5 locations
        topCompanies
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      message: 'Failed to retrieve analytics summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUserActivity,
  getApplicationTrends,
  getTopCompanies,
  getIndustryAnalytics,
  getLocationAnalytics,
  getStudentAnalytics,
  getAllUsers,
  getSystemHealth,
  exportData,
  updateUserStatus,
  getAnalyticsSummary
};