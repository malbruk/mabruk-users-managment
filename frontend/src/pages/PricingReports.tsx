import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPricingInsights } from '../api/client';

const trendToLabel: Record<string, string> = {
  up: 'Growing',
  down: 'Declining',
  flat: 'Steady'
};

export const PricingReports = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pricing-insights'],
    queryFn: fetchPricingInsights
  });

  const totals = useMemo(() => {
    if (!data) {
      return { revenue: 0, churn: 0 };
    }
    const revenue = data.reduce((sum, insight) => sum + insight.monthlyRevenue, 0);
    const churn = data.reduce((sum, insight) => sum + insight.churnRate, 0) / data.length;
    return { revenue, churn };
  }, [data]);

  return (
    <div className="section">
      <h2>Pricing Insights</h2>
      <p>Track plan performance and identify revenue optimization opportunities.</p>
      {isLoading ? <p>Loading insights…</p> : null}
      {error ? <p className="error-message">Failed to load insights.</p> : null}

      {data ? (
        <>
          <div className="summary-grid">
            <article>
              <h3>Monthly Recurring Revenue</h3>
              <p className="stat">${totals.revenue.toLocaleString()}</p>
            </article>
            <article>
              <h3>Average Churn Rate</h3>
              <p className="stat">{totals.churn.toFixed(2)}%</p>
            </article>
          </div>

          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Monthly Revenue</th>
                <th>Churn Rate</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.map((insight) => (
                <tr key={insight.planId}>
                  <td>{insight.planName}</td>
                  <td>${insight.monthlyRevenue.toLocaleString()}</td>
                  <td>{insight.churnRate.toFixed(2)}%</td>
                  <td>
                    <span className={`status-indicator trend-${insight.trend}`}>
                      <span className={`status-dot ${insight.trend === 'up' ? 'success' : insight.trend === 'down' ? 'error' : 'warning'}`} />
                      {trendToLabel[insight.trend]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
};
