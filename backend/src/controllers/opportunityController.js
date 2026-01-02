const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

// Create new opportunity (companies only)
const createOpportunity = async (req, res) => {
  try {
    const { title, description, requirements, slots, deadline, location, duration_months } = req.body;
    const company_id = req.user.company_id; // Set by middleware after verifying company role

    // Validation
    if (!title || !description || !deadline) {
      return res.status(400).json({
        message: 'Title, description, and deadline are required',
        required: ['title', 'description', 'deadline']
      });
    }

    // Validate deadline is in the future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({
        message: 'Deadline must be in the future'
      });
    }

    // Validate slots
    if (slots && (slots < 1 || slots > 100)) {
      return res.status(400).json({
        message: 'Slots must be between 1 and 100'
      });
    }

    // Validate duration
    if (duration_months && (duration_months < 1 || duration_months > 12)) {
      return res.status(400).json({
        message: 'Duration must be between 1 and 12 months'
      });
    }

    const opportunity = await Opportunity.create({
      company_id,
      title: title.trim(),
      description: description.trim(),
      requirements: requirements ? requirements.trim() : null,
      slots: slots || 1,
      deadline,
      location: location ? location.trim() : null,
      duration_months: duration_months || 3
    });

    res.status(201).json({
      message: 'Opportunity created successfully',
      opportunity
    });

  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({
      message: 'Failed to create opportunity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all active opportunities (students view)
const getActiveOpportunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const opportunities = await Opportunity.findAllActive(limit, offset);

    res.json({
      message: 'Active opportunities retrieved successfully',
      opportunities,
      pagination: {
        page,
        limit,
        total: opportunities.length
      }
    });

  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({
      message: 'Failed to retrieve opportunities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get company's opportunities (companies only)
const getCompanyOpportunities = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const opportunities = await Opportunity.findByCompany(company_id, limit, offset);

    res.json({
      message: 'Company opportunities retrieved successfully',
      opportunities,
      pagination: {
        page,
        limit,
        total: opportunities.length
      }
    });

  } catch (error) {
    console.error('Get company opportunities error:', error);
    res.status(500).json({
      message: 'Failed to retrieve company opportunities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single opportunity details
const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid opportunity ID is required'
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found'
      });
    }

    res.json({
      message: 'Opportunity retrieved successfully',
      opportunity
    });

  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({
      message: 'Failed to retrieve opportunity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update opportunity (companies only)
const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid opportunity ID is required'
      });
    }

    // Validate deadline if provided
    if (updates.deadline && new Date(updates.deadline) <= new Date()) {
      return res.status(400).json({
        message: 'Deadline must be in the future'
      });
    }

    // Validate slots if provided
    if (updates.slots && (updates.slots < 1 || updates.slots > 100)) {
      return res.status(400).json({
        message: 'Slots must be between 1 and 100'
      });
    }

    // Clean up string fields
    if (updates.title) updates.title = updates.title.trim();
    if (updates.description) updates.description = updates.description.trim();
    if (updates.requirements) updates.requirements = updates.requirements.trim();
    if (updates.location) updates.location = updates.location.trim();

    const opportunity = await Opportunity.update(id, company_id, updates);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found or access denied'
      });
    }

    res.json({
      message: 'Opportunity updated successfully',
      opportunity
    });

  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({
      message: 'Failed to update opportunity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Close opportunity (companies only)
const closeOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid opportunity ID is required'
      });
    }

    const opportunity = await Opportunity.close(id, company_id);

    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found or access denied'
      });
    }

    res.json({
      message: 'Opportunity closed successfully',
      opportunity
    });

  } catch (error) {
    console.error('Close opportunity error:', error);
    res.status(500).json({
      message: 'Failed to close opportunity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search opportunities
const searchOpportunities = async (req, res) => {
  try {
    const { q: searchTerm, industry, location, duration } = req.query;

    if (!searchTerm && !industry && !location && !duration) {
      return res.status(400).json({
        message: 'At least one search parameter is required',
        parameters: ['q', 'industry', 'location', 'duration']
      });
    }

    const filters = {};
    if (industry) filters.industry = industry;
    if (location) filters.location = location;
    if (duration) filters.duration_months = parseInt(duration);

    const opportunities = await Opportunity.search(searchTerm, filters);

    res.json({
      message: 'Search completed successfully',
      opportunities,
      searchTerm,
      filters,
      count: opportunities.length
    });

  } catch (error) {
    console.error('Search opportunities error:', error);
    res.status(500).json({
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get opportunity statistics (admin only)
const getOpportunityStats = async (req, res) => {
  try {
    const stats = await Opportunity.getStats();

    res.json({
      message: 'Opportunity statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get opportunity stats error:', error);
    res.status(500).json({
      message: 'Failed to retrieve opportunity statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createOpportunity,
  getActiveOpportunities,
  getCompanyOpportunities,
  getOpportunityById,
  updateOpportunity,
  closeOpportunity,
  searchOpportunities,
  getOpportunityStats
};