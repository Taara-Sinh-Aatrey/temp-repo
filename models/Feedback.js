const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class Feedback {
  /**
   * Create a new feedback
   * @param {Object} feedbackData - The feedback data
   * @returns {Promise<Object>} The created feedback
   */
  static async create(feedbackData) {
    const [feedback] = await db('feedback')
      .insert({
        id: uuidv4(),
        customer_id: feedbackData.customerId,
        merchant_id: feedbackData.merchantId,
        language: feedbackData.language,
        place: feedbackData.place,
        raw_text: feedbackData.rawText,
        translated_text: feedbackData.translatedText,
        entities: feedbackData.entities,
        magnitude: feedbackData.magnitude,
        score: feedbackData.score,
        category: feedbackData.category,
        discount_percentage: feedbackData.discountPercentage || 0,
        images: feedbackData.images || []
      })
      .returning('*');
    
    return this.formatFeedback(feedback);
  }

  /**
   * Get feedback by ID
   * @param {string} id - The feedback ID
   * @returns {Promise<Object|null>} The feedback or null if not found
   */
  static async getById(id) {
    const feedback = await db('feedback')
      .where({ id })
      .first();
    
    return feedback ? this.formatFeedback(feedback) : null;
  }

  /**
   * Get feedback by merchant ID
   * @param {string} merchantId - The merchant ID
   * @param {Object} filters - Optional filters like date range, sentiment, etc.
   * @returns {Promise<Array>} List of feedback for the merchant
   */
  static async getByMerchantId(merchantId, filters = {}) {
    let query = db('feedback')
      .where({ merchant_id: merchantId });
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
    }
    
    // Apply sentiment filter if provided
    if (filters.sentiment === 'positive') {
      query = query.where('score', '>=', 0);
    } else if (filters.sentiment === 'negative') {
      query = query.where('score', '<', 0);
    }

    // Apply QR code label filter if provided
    if (filters.qrLabel) {
      query = query.whereExists(function() {
        this.select('*')
          .from('QRCodes')
          .whereRaw('feedback.merchant_id = "QRCodes"."merchantId"')
          .andWhere('QRCodes.labelName', filters.qrLabel);
      });
    }
    
    // Apply pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    const feedbacks = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    return feedbacks.map(feedback => this.formatFeedback(feedback));
  }

  /**
   * Get total feedback count by merchant ID with time series data
   * @param {string} merchantId - The merchant ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Feedback count data
   */
  static async getTotalFeedbackCount(merchantId, filters = {}) {
    let query = db('feedback')
      .where({ merchant_id: merchantId });
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
    }

    // Apply QR code label filter if provided
    if (filters.qrLabel) {
      query = query.whereExists(function() {
        this.select('*')
          .from('QRCodes')
          .whereRaw('feedback.merchant_id = "QRCodes"."merchantId"')
          .andWhere('QRCodes.labelName', filters.qrLabel);
      });
    }
    
    // Group by time interval (day, week, month)
    const timeInterval = filters.timeInterval || 'day';
    let timeFormat;
    
    switch (timeInterval) {
      case 'day':
        timeFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        timeFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        timeFormat = 'YYYY-MM';
        break;
      default:
        timeFormat = 'YYYY-MM-DD';
    }
    
    const positiveResult = await query.clone()
      .select(db.raw(`to_char(created_at, '${timeFormat}') as time_period`))
      .count('id as count')
      .where('score', '>=', 0)
      .groupBy('time_period')
      .orderBy('time_period');
    
    const negativeResult = await query.clone()
      .select(db.raw(`to_char(created_at, '${timeFormat}') as time_period`))
      .count('id as count')
      .where('score', '<', 0)
      .groupBy('time_period')
      .orderBy('time_period');
    
    const totalCount = await query.clone().count('id as count').first();
    
    return {
      total: parseInt(totalCount.count),
      timeSeries: {
        positive: positiveResult.map(item => ({
          timePeriod: item.time_period,
          count: parseInt(item.count)
        })),
        negative: negativeResult.map(item => ({
          timePeriod: item.time_period,
          count: parseInt(item.count)
        }))
      }
    };
  }

  /**
   * Get customer revisit data
   * @param {string} merchantId - The merchant ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Customer revisit data
   */
  static async getCustomerRevisits(merchantId, filters = {}) {
    let query = db('feedback')
      .where({ merchant_id: merchantId });
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
    }
    
    // Group by time interval (day, week, month)
    const timeInterval = filters.timeInterval || 'day';
    let timeFormat;
    
    switch (timeInterval) {
      case 'day':
        timeFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        timeFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        timeFormat = 'YYYY-MM';
        break;
      default:
        timeFormat = 'YYYY-MM-DD';
    }
    
    // Get customer visit count
    const customerVisits = await db('feedback')
      .select('customer_id')
      .count('* as visit_count')
      .where({ merchant_id: merchantId })
      .groupBy('customer_id');
    
    // Calculate visits by frequency
    const oneTimeVisits = customerVisits.filter(v => parseInt(v.visit_count) === 1).length;
    const twoTimeVisits = customerVisits.filter(v => parseInt(v.visit_count) === 2).length;
    const multipleVisits = customerVisits.filter(v => parseInt(v.visit_count) > 2).length;
    
    // Get time series data
    const visitsByTime = await query
      .select(db.raw(`to_char(created_at, '${timeFormat}') as time_period`))
      .count('distinct customer_id as count')
      .groupBy('time_period')
      .orderBy('time_period');
    
    return {
      visitFrequency: {
        oneTime: oneTimeVisits,
        twoTime: twoTimeVisits,
        multiple: multipleVisits
      },
      timeSeries: visitsByTime.map(item => ({
        timePeriod: item.time_period,
        count: parseInt(item.count)
      }))
    };
  }

  /**
   * Get sentiment analysis data
   * @param {string} merchantId - The merchant ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Sentiment analysis data
   */
  static async getSentimentAnalysis(merchantId, filters = {}) {
    let query = db('feedback')
      .where({ merchant_id: merchantId });
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
    }

    // Apply QR code label filter if provided
    if (filters.qrLabel) {
      query = query.whereExists(function() {
        this.select('*')
          .from('QRCodes')
          .whereRaw('feedback.merchant_id = "QRCodes"."merchantId"')
          .andWhere('QRCodes.labelName', filters.qrLabel);
      });
    }
    
    // Group by time interval (day, week, month)
    const timeInterval = filters.timeInterval || 'day';
    let timeFormat;
    
    switch (timeInterval) {
      case 'day':
        timeFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        timeFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        timeFormat = 'YYYY-MM';
        break;
      default:
        timeFormat = 'YYYY-MM-DD';
    }
    
    // Get time series data for sentiment scores
    const sentimentByTime = await query
      .select(db.raw(`to_char(created_at, '${timeFormat}') as time_period`))
      .avg('score as avg_score')
      .groupBy('time_period')
      .orderBy('time_period');
    
    // Get overall sentiment stats
    const sentimentStats = await query.clone()
      .select(
        db.raw('COUNT(CASE WHEN score >= 0 THEN 1 END) as positive_count'),
        db.raw('COUNT(CASE WHEN score < 0 THEN 1 END) as negative_count'),
        db.raw('AVG(score) as avg_score')
      )
      .first();
    
    // Get sentiment distribution (1-5 scale)
    const sentimentDistribution = await query.clone()
      .select(
        db.raw('CASE WHEN score BETWEEN -1 AND -0.6 THEN 1 WHEN score BETWEEN -0.6 AND -0.2 THEN 2 WHEN score BETWEEN -0.2 AND 0.2 THEN 3 WHEN score BETWEEN 0.2 AND 0.6 THEN 4 WHEN score BETWEEN 0.6 AND 1 THEN 5 END as rating'),
        db.raw('COUNT(*) as count')
      )
      .whereNotNull('score')
      .groupBy('rating')
      .orderBy('rating');
    
    return {
      overall: {
        positiveCount: parseInt(sentimentStats.positive_count) || 0,
        negativeCount: parseInt(sentimentStats.negative_count) || 0,
        averageScore: parseFloat(sentimentStats.avg_score) || 0
      },
      distribution: sentimentDistribution.map(item => ({
        rating: parseInt(item.rating),
        count: parseInt(item.count)
      })),
      timeSeries: sentimentByTime.map(item => ({
        timePeriod: item.time_period,
        averageScore: parseFloat(item.avg_score) || 0
      }))
    };
  }

  /**
   * Get top trends (entities) from feedback
   * @param {string} merchantId - The merchant ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Top trends data
   */
  static async getTopTrends(merchantId, filters = {}) {
    let query = db('feedback')
      .where({ 
        merchant_id: merchantId
      })
      .where('score', '>=', 0); // Positive feedback
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
    }
    
    // Get all feedback that matches criteria
    const feedbacks = await query.select('entities');
    
    // Process entities to get frequency
    const entityCount = {};
    
    feedbacks.forEach(feedback => {
      if (feedback.entities && feedback.entities.length) {
        feedback.entities.forEach(entity => {
          entityCount[entity] = (entityCount[entity] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort
    const trends = Object.entries(entityCount)
      .map(([entity, count]) => ({ entity, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Get top 5
    
    return trends;
  }

  /**
   * Get bottom trends (entities) from feedback
   * @param {string} merchantId - The merchant ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Bottom trends data
   */
  static async getBottomTrends(merchantId, filters = {}) {
    let query = db('feedback')
      .where({ 
        merchant_id: merchantId
      })
      .where('score', '<', 0); // Negative feedback
    
    // Apply date range filter if provided
    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
    }
    
    // Get all feedback that matches criteria
    const feedbacks = await query.select('entities');
    
    // Process entities to get frequency
    const entityCount = {};
    
    feedbacks.forEach(feedback => {
      if (feedback.entities && feedback.entities.length) {
        feedback.entities.forEach(entity => {
          entityCount[entity] = (entityCount[entity] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort
    const trends = Object.entries(entityCount)
      .map(([entity, count]) => ({ entity, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Get top 5
    
    return trends;
  }

  /**
   * Format feedback data to camelCase for API response
   * @param {Object} feedback - The feedback data from database
   * @returns {Object} Formatted feedback data
   */
  static formatFeedback(feedback) {
    return {
      id: feedback.id,
      customerId: feedback.customer_id,
      merchantId: feedback.merchant_id,
      language: feedback.language,
      place: feedback.place,
      rawText: feedback.raw_text,
      translatedText: feedback.translated_text,
      entities: feedback.entities,
      magnitude: feedback.magnitude,
      score: feedback.score,
      category: feedback.category,
      discountPercentage: feedback.discount_percentage,
      isDiscountClaimed: feedback.is_discount_claimed,
      discountClaimedDate: feedback.discount_claimed_date,
      discountExpiryDate: feedback.discount_expiry_date,
      images: feedback.images,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at
    };
  }
}