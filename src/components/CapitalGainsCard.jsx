
import React from 'react';
import PropTypes from 'prop-types';
import './CapitalGainsCars.css';

const formatCurrency = (value) => `₹${Math.abs(Number(value)).toFixed(2)}`;

const CapitalGainsCard = ({ title, data, savings }) => {
  const netSTCG = data.stcg.profits - data.stcg.losses;
  const netLTCG = data.ltcg.profits - data.ltcg.losses;
  const realisedCapitalGains = netSTCG + netLTCG;

  return (
    <div className="capital-gains-card">
      <h2 className="card-title">{title}</h2>

      <div className="section">
        <h3 className="section-title">Short-term Gains</h3>
        <div className="grid">
          <p>Profits:</p><p className="text-right">{formatCurrency(data.stcg.profits)}</p>
          <p>Losses:</p><p className="text-right">{formatCurrency(data.stcg.losses)}</p>
          <p className="font-semibold mt-1">Net STCG:</p>
          <p className={`text-right font-semibold mt-1 ${netSTCG >= 0 ? 'text-green' : 'text-red'}`}>
            {formatCurrency(netSTCG)}
          </p>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Long-term Gains</h3>
        <div className="grid">
          <p>Profits:</p><p className="text-right">{formatCurrency(data.ltcg.profits)}</p>
          <p>Losses:</p><p className="text-right">{formatCurrency(data.ltcg.losses)}</p>
          <p className="font-semibold mt-1">Net LTCG:</p>
          <p className={`text-right font-semibold mt-1 ${netLTCG >= 0 ? 'text-green' : 'text-red'}`}>
            {formatCurrency(netLTCG)}
          </p>
        </div>
      </div>

      <hr className="divider" />

      <div className="realised-gains">
        <p className="realised-label">Realised Capital Gains:</p>
        <p className={`realised-value ${realisedCapitalGains >= 0 ? 'text-green' : 'text-red'}`}>
          {formatCurrency(realisedCapitalGains)}
        </p>
      </div>

      {savings > 0 && (
        <div className="tax-savings">
          <p>
            You're going to save <strong>{formatCurrency(savings)}</strong> in taxes! 🥳
          </p>
        </div>
      )}
    </div>
  );
};

CapitalGainsCard.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.shape({
    stcg: PropTypes.shape({
      profits: PropTypes.number,
      losses: PropTypes.number
    }),
    ltcg: PropTypes.shape({
      profits: PropTypes.number,
      losses: PropTypes.number
    })
  }).isRequired,
  savings: PropTypes.number
};

CapitalGainsCard.defaultProps = {
  savings: 0
};

// Wrapper container component for side-by-side layout
export const CapitalGainsCardsContainer = ({ children }) => {
  return <div className="cards-container">{children}</div>;
};

CapitalGainsCardsContainer.propTypes = {
  children: PropTypes.node.isRequired
};

export default CapitalGainsCard;
