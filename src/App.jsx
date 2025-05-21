import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { fetchHoldings, fetchCapitalGains } from './services/mockApi';
import CapitalGainsCard, { CapitalGainsCardsContainer } from './components/CapitalGainsCard';


import HoldingsTable from './components/HoldingsTables';

const App = () => {
  const [initialCapitalGains, setInitialCapitalGains] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [selectedHoldingIds, setSelectedHoldingIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [gainsResponse, holdingsResponse] = await Promise.all([
          fetchCapitalGains(),
          fetchHoldings(),
        ]);
        setInitialCapitalGains(gainsResponse.capitalGains);
        const sortedHoldings = [...holdingsResponse].sort((a, b) => a.coin.localeCompare(b.coin));
        setHoldings(sortedHoldings);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectHolding = (holdingId) => {
    setSelectedHoldingIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      newSelected.has(holdingId) ? newSelected.delete(holdingId) : newSelected.add(holdingId);
      return newSelected;
    });
  };

  const handleSelectAllHoldings = (selectAll) => {
    setSelectedHoldingIds(selectAll ? new Set(holdings.map(h => h.id)) : new Set());
  };

  const isAllHoldingsSelected = holdings.length > 0 && selectedHoldingIds.size === holdings.length;

  const postHarvestingGains = useMemo(() => {
    if (!initialCapitalGains) return null;

    return Array.from(selectedHoldingIds).reduce((acc, id) => {
      const holding = holdings.find(h => h.id === id);
      if (holding) {
        ['stcg', 'ltcg'].forEach(type => {
          const gain = holding[type].gain;
          gain > 0 ? acc[type].profits += gain : acc[type].losses += Math.abs(gain);
        });
      }
      return acc;
    }, JSON.parse(JSON.stringify(initialCapitalGains)));
  }, [initialCapitalGains, selectedHoldingIds, holdings]);

  const calculateRealisedGains = (data) => {
    if (!data) return 0;
    return (data.stcg.profits - data.stcg.losses) + (data.ltcg.profits - data.ltcg.losses);
  };

  const initialRealised = calculateRealisedGains(initialCapitalGains);
  const postHarvestRealised = calculateRealisedGains(postHarvestingGains);
  const savings = initialRealised - postHarvestRealised;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-gray-700">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <header className="heading-container">
        <h1 className="heading-title">Tax Loss Harvesting Tool</h1>

        <div className="info-dropdown">
          <button className="info-button">How it works?</button>
          <div className="info-content">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio odio omnis enim est facilis aliquid, cupiditate officiis soluta placeat veniam suscipit dolor, iusto beatae cumque dolores illum, sed id animi!
          </div>
        </div>
      </header>
      <div className="disclaimer-container">
        <button className="disclaimer-toggle" onClick={() => setShowDisclaimer(!showDisclaimer)}>
          {showDisclaimer ? 'Hide' : 'Show'} Important Notes & Disclaimers
        </button>

        {showDisclaimer && (
          <div className="disclaimer-content">
            <ul>
              <li>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</li>
              <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius et facilis asperiores at sunt odio aut dolores qui dolor esse!</li>
              <li>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquid amet nesciunt quit.</li>
              <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum deserunt voluptatibus dicta consectetur repellendus?</li>
            </ul>
          </div>
        )}
      </div>




      <CapitalGainsCardsContainer>
        <CapitalGainsCard
          title="Pre-Harvesting Capital Gains"
          data={initialCapitalGains || { stcg: { profits: 0, losses: 0 }, ltcg: { profits: 0, losses: 0 } }}
          backgroundColor="bg-harvest-dark"
          textColor="text-white"
        />
        <CapitalGainsCard
          title="After Harvesting Capital Gains"
          data={postHarvestingGains || { stcg: { profits: 0, losses: 0 }, ltcg: { profits: 0, losses: 0 } }}
          backgroundColor="bg-harvest-blue"
          textColor="text-white"
          savings={savings > 0 ? savings : null}
        />
      </CapitalGainsCardsContainer>





      <HoldingsTable
        holdings={holdings}
        selectedHoldings={selectedHoldingIds}
        onSelectHolding={handleSelectHolding}
        onSelectAllHoldings={handleSelectAllHoldings}
        isAllSelected={isAllHoldingsSelected}
      />

      {selectedHoldingIds.size > 0 && (
        <button
          onClick={() => setSelectedHoldingIds(new Set())}
          className="disclaimer-toggle"
        >
          Clear Selected Holdings
        </button>
      )}

      
    </div>
  );
};

export default App;