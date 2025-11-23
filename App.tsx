import React, { useState } from 'react';
import { ProjectProvider } from './contexts/ProjectContext';
import Layout from './components/Layout';
import FinancialsView from './components/FinancialsView';
import SiteEvalView from './components/SiteEvalView';
import NegotiationView from './components/NegotiationView';
import { AppView } from './types';

const App: React.FC = () => {
  // Updated default view to match the requested logical flow: Site -> Negotiation -> Financials
  const [currentView, setCurrentView] = useState<AppView>(AppView.SITE_EVALUATION);

  const renderView = () => {
    switch (currentView) {
      case AppView.FINANCIALS:
        return <FinancialsView />;
      case AppView.SITE_EVALUATION:
        return <SiteEvalView />;
      case AppView.NEGOTIATION:
        return <NegotiationView />;
      default:
        return <SiteEvalView />;
    }
  };

  return (
    <ProjectProvider>
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
      </Layout>
    </ProjectProvider>
  );
};

export default App;