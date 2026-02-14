// components/spaces/blueprint/market/MarketOverview.js
// Market research overview dashboard

import { useMemo } from 'react';
import { useBlueprint, formatCurrency } from '../BlueprintContext';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function MarketOverview({ onNavigate }) {
  const { initiatives, getInitiativesByStage } = useBlueprint();

  // Aggregate market data across all initiatives
  const marketData = useMemo(() => {
    const withMarketSizing = initiatives.filter(i => i.explore?.market_sizing?.tam);
    const totalTAM = withMarketSizing.reduce((sum, i) => sum + (i.explore?.market_sizing?.tam || 0), 0);
    const totalSAM = withMarketSizing.reduce((sum, i) => sum + (i.explore?.market_sizing?.sam || 0), 0);
    const totalSOM = withMarketSizing.reduce((sum, i) => sum + (i.explore?.market_sizing?.som || 0), 0);

    // Count unique competitors across all initiatives
    const allCompetitors = new Set();
    initiatives.forEach(i => {
      i.explore?.competitors?.forEach(c => allCompetitors.add(c.name));
    });

    // Count PESTLE analyses
    const withPESTLE = initiatives.filter(i => i.explore?.pestle).length;

    return {
      initiativesWithSizing: withMarketSizing.length,
      totalTAM,
      totalSAM,
      totalSOM,
      uniqueCompetitors: allCompetitors.size,
      withPESTLE,
      topInitiativesBySOM: [...withMarketSizing]
        .sort((a, b) => (b.explore?.market_sizing?.som || 0) - (a.explore?.market_sizing?.som || 0))
        .slice(0, 5),
    };
  }, [initiatives]);

  return (
    <div className="market-overview">
      <div className="market-overview-header">
        <div>
          <h1>Market Intelligence</h1>
          <p>Aggregate market research across all initiatives</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="market-summary-grid">
        <div className="market-summary-card" onClick={() => onNavigate?.('tamsam')}>
          <TrendingUpIcon className="market-summary-icon" />
          <div className="market-summary-content">
            <span className="market-summary-label">Total Addressable Market</span>
            <span className="market-summary-value">{formatCurrency(marketData.totalTAM)}</span>
            <span className="market-summary-sub">{marketData.initiativesWithSizing} initiatives sized</span>
          </div>
        </div>

        <div className="market-summary-card" onClick={() => onNavigate?.('tamsam')}>
          <BarChartIcon className="market-summary-icon" />
          <div className="market-summary-content">
            <span className="market-summary-label">Serviceable Obtainable</span>
            <span className="market-summary-value">{formatCurrency(marketData.totalSOM)}</span>
            <span className="market-summary-sub">Realistic target market</span>
          </div>
        </div>

        <div className="market-summary-card" onClick={() => onNavigate?.('competitors')}>
          <GroupsIcon className="market-summary-icon" />
          <div className="market-summary-content">
            <span className="market-summary-label">Competitors Tracked</span>
            <span className="market-summary-value">{marketData.uniqueCompetitors}</span>
            <span className="market-summary-sub">Across all initiatives</span>
          </div>
        </div>

        <div className="market-summary-card" onClick={() => onNavigate?.('pestle')}>
          <PublicIcon className="market-summary-icon" />
          <div className="market-summary-content">
            <span className="market-summary-label">PESTLE Analyses</span>
            <span className="market-summary-value">{marketData.withPESTLE}</span>
            <span className="market-summary-sub">Environmental scans</span>
          </div>
        </div>
      </div>

      {/* Top initiatives by SOM */}
      <div className="market-section">
        <h2>Top Opportunities by SOM</h2>
        {marketData.topInitiativesBySOM.length > 0 ? (
          <table className="market-table">
            <thead>
              <tr>
                <th>Initiative</th>
                <th>TAM</th>
                <th>SAM</th>
                <th>SOM</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {marketData.topInitiativesBySOM.map(initiative => (
                <tr key={initiative.id}>
                  <td>
                    <strong>{initiative.display_id}</strong> - {initiative.name}
                  </td>
                  <td>{formatCurrency(initiative.explore?.market_sizing?.tam)}</td>
                  <td>{formatCurrency(initiative.explore?.market_sizing?.sam)}</td>
                  <td>{formatCurrency(initiative.explore?.market_sizing?.som)}</td>
                  <td className="capitalize">{initiative.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="market-empty">
            <p>No initiatives have market sizing yet.</p>
            <button className="btn btn-primary" onClick={() => onNavigate?.('explore')}>
              Start Market Research
            </button>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="market-section">
        <h2>Market Research Tools</h2>
        <div className="market-tools-grid">
          <button className="market-tool-card" onClick={() => onNavigate?.('tamsam')}>
            <TrendingUpIcon />
            <span>TAM/SAM/SOM Calculator</span>
            <p>Size your market opportunity</p>
          </button>
          <button className="market-tool-card" onClick={() => onNavigate?.('competitors')}>
            <GroupsIcon />
            <span>Competitor Analysis</span>
            <p>Map the competitive landscape</p>
          </button>
          <button className="market-tool-card" onClick={() => onNavigate?.('pestle')}>
            <PublicIcon />
            <span>PESTLE Analysis</span>
            <p>Scan the external environment</p>
          </button>
        </div>
      </div>
    </div>
  );
}
