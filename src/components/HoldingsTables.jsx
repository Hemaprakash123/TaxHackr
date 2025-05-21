import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './HoldingsTables.css';

const formatAmount = (value) => Number(value).toFixed(8);
const formatCurrency = (value) => `₹${Number(value).toFixed(2)}`;

const HoldingsTable = ({
  holdings,
  selectedHoldings,
  onSelectHolding,
  onSelectAllHoldings,
  isAllSelected
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedHoldings = React.useMemo(() => {
    if (!sortConfig.key) return holdings;

    return [...holdings].sort((a, b) => {
      // For nested gain properties (stcg.gain and ltcg.gain)
      const valueA = sortConfig.key.includes('.') 
        ? sortConfig.key.split('.').reduce((o, i) => o[i], a)
        : a[sortConfig.key];
      
      const valueB = sortConfig.key.includes('.') 
        ? sortConfig.key.split('.').reduce((o, i) => o[i], b)
        : b[sortConfig.key];

      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [holdings, sortConfig]);

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Your Holdings</h2>
      {holdings.length === 0 ? (
        <p className="no-data">No holdings data available.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAllHoldings(e.target.checked)}
                    aria-label={isAllSelected ? 'Deselect all holdings' : 'Select all holdings'}
                  />
                </th>
                <th>Asset</th>
                <th>Holdings / Avg Buy Price</th>
                <th>Current Price</th>
                <th 
                  className="sortable-header"
                  onClick={() => requestSort('stcg.gain')}
                >
                  Short-Term Gain {getSortIndicator('stcg.gain')}
                </th>
                <th 
                  className="sortable-header"
                  onClick={() => requestSort('ltcg.gain')}
                >
                  Long-Term Gain {getSortIndicator('ltcg.gain')}
                </th>
                <th>Amount to Sell</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((holding) => (
                <tr
                  key={holding.id}
                  className={selectedHoldings.has(holding.id) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={selectedHoldings.has(holding.id)}
                      onChange={() => onSelectHolding(holding.id)}
                      aria-label={`Select ${holding.coin}`}
                    />
                  </td>
                  <td>
                    <div className="asset-info">
                      {holding.logo && (
                        <img
                          src={holding.logo}
                          alt={holding.coinName}
                          className="asset-logo"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <div className="asset-name">{holding.coin}</div>
                        <div className="asset-fullname">{holding.coinName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="amount-cell">
                    <div>{formatAmount(holding.totalHolding)}</div>
                    <div className="amount-small">{formatCurrency(holding.averageBuyPrice)}</div>
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td>
                    <span className={holding.stcg.gain >= 0 ? 'text-green' : 'text-red'}>
                      {formatCurrency(holding.stcg.gain)}
                    </span>
                    <div className="amount-small">{formatAmount(holding.stcg.balance)}</div>
                  </td>
                  <td>
                    <span className={holding.ltcg.gain >= 0 ? 'text-green' : 'text-red'}>
                      {formatCurrency(holding.ltcg.gain)}
                    </span>
                    <div className="amount-small">{formatAmount(holding.ltcg.balance)}</div>
                  </td>
                  <td className="amount-cell">
                    {selectedHoldings.has(holding.id) ? formatAmount(holding.totalHolding) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

HoldingsTable.propTypes = {
  holdings: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    coin: PropTypes.string.isRequired,
    coinName: PropTypes.string,
    logo: PropTypes.string,
    totalHolding: PropTypes.number,
    averageBuyPrice: PropTypes.number,
    currentPrice: PropTypes.number,
    stcg: PropTypes.shape({
      gain: PropTypes.number,
      balance: PropTypes.number
    }),
    ltcg: PropTypes.shape({
      gain: PropTypes.number,
      balance: PropTypes.number
    })
  })).isRequired,
  selectedHoldings: PropTypes.instanceOf(Set).isRequired,
  onSelectHolding: PropTypes.func.isRequired,
  onSelectAllHoldings: PropTypes.func.isRequired,
  isAllSelected: PropTypes.bool.isRequired
};

export default HoldingsTable;