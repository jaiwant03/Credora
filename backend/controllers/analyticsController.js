const Verification = require('../models/Verification');

async function getAnalytics(req, res, next) {
  try {
    const { days = 14 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Total verifications
    const totalVerifications = await Verification.countDocuments({
      created_at: { $gte: daysAgo }
    });

    // By status
    const byStatus = await Verification.aggregate([
      { $match: { created_at: { $gte: daysAgo } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      verified: 0,
      conflict_resolved: 0,
      low_confidence: 0,
      unable_to_verify: 0,
      pending: 0
    };

    byStatus.forEach(item => {
      if (item._id && statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    // Verified total (verified + conflict_resolved)
    const verifiedTotal = statusCounts.verified + statusCounts.conflict_resolved;

    // Average confidence
    const avgResult = await Verification.aggregate([
      { $match: { created_at: { $gte: daysAgo } } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence_score' } } }
    ]);

    const averageConfidence = avgResult.length > 0 ? Math.round(avgResult[0].avgConfidence) : 0;

    // Conflicts detected
    const conflictsDetected = await Verification.countDocuments({
      created_at: { $gte: daysAgo },
      $or: [
        { conflict_detected: true },
        { conflictDetected: true },
        { status: 'conflict_resolved' }
      ]
    });

    // Confidence distribution
    const allVerifications = await Verification.find({ created_at: { $gte: daysAgo } }).lean();

    const distribution = {
      veryHigh: 0,
      high: 0,
      moderate: 0,
      low: 0,
      very_low: 0,
      unable: 0
    };

    allVerifications.forEach(v => {
      const score = v.confidence_score !== undefined ? v.confidence_score : (v.confidenceScore || 0);
      if (score >= 90) distribution.veryHigh++;
      else if (score >= 75) distribution.high++;
      else if (score >= 60) distribution.moderate++;
      else distribution.low++;
    });

    distribution.very_high = distribution.veryHigh;

    // Classifications
    const byClassification = await Verification.aggregate([
      { $match: { created_at: { $gte: daysAgo } } },
      { $group: { _id: '$classification', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const classificationsMap = {};
    const categoriesList = [];

    byClassification.forEach(item => {
      const cls = item._id || 'general';
      classificationsMap[cls] = item.count;
      categoriesList.push({ classification: cls, count: item.count });
    });

    // Daily trend
    const dailyTrend = await Verification.aggregate([
      { $match: { created_at: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence_score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trend = dailyTrend.map(day => ({
      date: day._id,
      count: day.count,
      avgConfidence: Math.round(day.avgConfidence || 0)
    }));

    const successRate = totalVerifications > 0
      ? Math.round((verifiedTotal / totalVerifications) * 100)
      : 100;

    const summary = {
      total: totalVerifications,
      verified: verifiedTotal,
      conflicts: conflictsDetected,
      avgConfidence: averageConfidence,
      unableToVerify: statusCounts.unable_to_verify,
      successRate
    };

    res.json({
      summary,
      totalVerifications,
      verifiedTotal,
      byStatus: statusCounts,
      averageConfidence,
      confidenceDistribution: distribution,
      byClassification: classificationsMap,
      categories: categoriesList,
      conflictsDetected,
      dailyTrend: trend,
      dailyActivity: trend,
      period: `${days} days`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
