// tests/unit/portfolio/scoring.test.js
// Unit tests for portfolio scoring calculations

describe('Portfolio Scoring Calculations', () => {
  // WSJF score calculation
  describe('WSJF Scoring', () => {
    // WSJF = (Business Value + Time Criticality + Risk Reduction) / Job Size
    const calculateWSJF = (businessValue, timeCriticality, riskReduction, jobSize) => {
      const sizeMultipliers = { xs: 1, s: 2, m: 3, l: 5, xl: 8 };
      const numerator = businessValue + timeCriticality + riskReduction;
      const denominator = sizeMultipliers[jobSize] || 3;
      return Math.round((numerator / denominator) * 100) / 100;
    };

    test('calculates basic WSJF score correctly', () => {
      // High value, low effort = high score
      expect(calculateWSJF(8, 5, 3, 'xs')).toBe(16);

      // Same numerator, larger size = lower score
      expect(calculateWSJF(8, 5, 3, 'm')).toBeCloseTo(5.33, 2);
    });

    test('handles edge cases', () => {
      // Minimum values
      expect(calculateWSJF(1, 1, 1, 'xl')).toBeCloseTo(0.38, 2);

      // Maximum reasonable values
      expect(calculateWSJF(13, 13, 13, 'xs')).toBe(39);
    });

    test('larger job sizes reduce score', () => {
      const score_xs = calculateWSJF(5, 5, 5, 'xs');
      const score_s = calculateWSJF(5, 5, 5, 's');
      const score_m = calculateWSJF(5, 5, 5, 'm');
      const score_l = calculateWSJF(5, 5, 5, 'l');
      const score_xl = calculateWSJF(5, 5, 5, 'xl');

      expect(score_xs).toBeGreaterThan(score_s);
      expect(score_s).toBeGreaterThan(score_m);
      expect(score_m).toBeGreaterThan(score_l);
      expect(score_l).toBeGreaterThan(score_xl);
    });
  });

  // RICE score calculation
  describe('RICE Scoring', () => {
    // RICE = (Reach * Impact * Confidence) / Effort
    const calculateRICE = (reach, impact, confidence, effort) => {
      const impactMultipliers = { minimal: 0.25, low: 0.5, medium: 1, high: 2, massive: 3 };
      const confidenceMultipliers = { low: 0.5, medium: 0.8, high: 1 };
      const effortMultipliers = { xs: 0.5, s: 1, m: 2, l: 3, xl: 5 };

      const numerator = reach * (impactMultipliers[impact] || 1) * (confidenceMultipliers[confidence] || 0.8);
      const denominator = effortMultipliers[effort] || 2;
      return Math.round((numerator / denominator) * 100) / 100;
    };

    test('calculates basic RICE score correctly', () => {
      // High reach, high impact, high confidence, low effort = high score
      expect(calculateRICE(1000, 'high', 'high', 'xs')).toBe(4000);

      // Same but with medium effort
      expect(calculateRICE(1000, 'high', 'high', 'm')).toBe(1000);
    });

    test('confidence affects score appropriately', () => {
      const highConf = calculateRICE(100, 'medium', 'high', 'm');
      const medConf = calculateRICE(100, 'medium', 'medium', 'm');
      const lowConf = calculateRICE(100, 'medium', 'low', 'm');

      expect(highConf).toBeGreaterThan(medConf);
      expect(medConf).toBeGreaterThan(lowConf);
    });

    test('impact multipliers work correctly', () => {
      const massive = calculateRICE(100, 'massive', 'high', 'm');
      const high = calculateRICE(100, 'high', 'high', 'm');
      const medium = calculateRICE(100, 'medium', 'high', 'm');
      const low = calculateRICE(100, 'low', 'high', 'm');
      const minimal = calculateRICE(100, 'minimal', 'high', 'm');

      expect(massive).toBeGreaterThan(high);
      expect(high).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(low);
      expect(low).toBeGreaterThan(minimal);
    });
  });

  // Budget calculations
  describe('Budget Calculations', () => {
    const SIZE_COST_ESTIMATES = {
      xs: 25000,
      s: 75000,
      m: 200000,
      l: 500000,
      xl: 1000000,
    };

    const calculateCommittedCost = (initiatives) => {
      return initiatives.reduce((sum, init) => {
        const size = init.custom_fields?.size;
        const cost = init.custom_fields?.estimated_cost || SIZE_COST_ESTIMATES[size] || 0;
        return sum + cost;
      }, 0);
    };

    test('calculates committed cost from t-shirt sizes', () => {
      const initiatives = [
        { custom_fields: { size: 'xs' } },
        { custom_fields: { size: 's' } },
        { custom_fields: { size: 'm' } },
      ];

      expect(calculateCommittedCost(initiatives)).toBe(300000); // 25k + 75k + 200k
    });

    test('uses explicit cost if provided', () => {
      const initiatives = [
        { custom_fields: { size: 'xs', estimated_cost: 50000 } },
        { custom_fields: { size: 's' } },
      ];

      expect(calculateCommittedCost(initiatives)).toBe(125000); // 50k + 75k
    });

    test('handles missing size gracefully', () => {
      const initiatives = [
        { custom_fields: {} },
        { custom_fields: { size: 's' } },
      ];

      expect(calculateCommittedCost(initiatives)).toBe(75000); // 0 + 75k
    });
  });

  // Quadrant classification
  describe('Priority Matrix Quadrant Classification', () => {
    const classifyQuadrant = (valueScore, effortScore) => {
      // Score range 1-13, midpoint at 7
      const highValue = valueScore >= 7;
      const highEffort = effortScore >= 7;

      if (highValue && !highEffort) return 'quick_wins';
      if (highValue && highEffort) return 'big_bets';
      if (!highValue && !highEffort) return 'fill_ins';
      return 'money_pits';
    };

    test('classifies quick wins correctly', () => {
      expect(classifyQuadrant(10, 3)).toBe('quick_wins');
      expect(classifyQuadrant(8, 5)).toBe('quick_wins');
    });

    test('classifies big bets correctly', () => {
      expect(classifyQuadrant(10, 10)).toBe('big_bets');
      expect(classifyQuadrant(8, 8)).toBe('big_bets');
    });

    test('classifies fill-ins correctly', () => {
      expect(classifyQuadrant(3, 3)).toBe('fill_ins');
      expect(classifyQuadrant(5, 5)).toBe('fill_ins');
    });

    test('classifies money pits correctly', () => {
      expect(classifyQuadrant(3, 10)).toBe('money_pits');
      expect(classifyQuadrant(5, 8)).toBe('money_pits');
    });

    test('handles boundary cases', () => {
      expect(classifyQuadrant(7, 6)).toBe('quick_wins');
      expect(classifyQuadrant(7, 7)).toBe('big_bets');
      expect(classifyQuadrant(6, 6)).toBe('fill_ins');
      expect(classifyQuadrant(6, 7)).toBe('money_pits');
    });
  });
});

describe('Vote Summary Calculations', () => {
  const calculateVoteSummary = (votes) => {
    const summary = {
      total: votes.length,
      approve: votes.filter(v => v.vote === 'approve').length,
      reject: votes.filter(v => v.vote === 'reject').length,
      abstain: votes.filter(v => v.vote === 'abstain').length,
    };

    const votesCount = summary.approve + summary.reject;
    summary.approvalPercent = votesCount > 0
      ? Math.round((summary.approve / votesCount) * 100)
      : 0;

    return summary;
  };

  test('calculates approval percentage correctly', () => {
    const votes = [
      { vote: 'approve' },
      { vote: 'approve' },
      { vote: 'reject' },
    ];

    const summary = calculateVoteSummary(votes);
    expect(summary.approvalPercent).toBe(67); // 2/3 = 66.67%
  });

  test('excludes abstain from approval calculation', () => {
    const votes = [
      { vote: 'approve' },
      { vote: 'approve' },
      { vote: 'abstain' },
      { vote: 'abstain' },
    ];

    const summary = calculateVoteSummary(votes);
    expect(summary.approvalPercent).toBe(100); // 2/2, abstains don't count
    expect(summary.total).toBe(4);
  });

  test('handles empty votes', () => {
    const summary = calculateVoteSummary([]);
    expect(summary.total).toBe(0);
    expect(summary.approvalPercent).toBe(0);
  });

  test('handles all rejections', () => {
    const votes = [
      { vote: 'reject' },
      { vote: 'reject' },
    ];

    const summary = calculateVoteSummary(votes);
    expect(summary.approvalPercent).toBe(0);
  });
});

describe('Currency Formatting', () => {
  const formatCurrency = (amount, short = false) => {
    if (amount >= 1000000) {
      return short ? `$${(amount / 1000000).toFixed(1)}M` : `$${(amount / 1000000).toLocaleString()}M`;
    }
    if (amount >= 1000) {
      return short ? `$${(amount / 1000).toFixed(0)}K` : `$${(amount / 1000).toLocaleString()}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  test('formats millions correctly', () => {
    expect(formatCurrency(1500000, true)).toBe('$1.5M');
    expect(formatCurrency(2000000, true)).toBe('$2.0M');
  });

  test('formats thousands correctly', () => {
    expect(formatCurrency(250000, true)).toBe('$250K');
    expect(formatCurrency(75000, true)).toBe('$75K');
  });

  test('formats small amounts correctly', () => {
    expect(formatCurrency(500)).toBe('$500');
    expect(formatCurrency(999)).toBe('$999');
  });
});
