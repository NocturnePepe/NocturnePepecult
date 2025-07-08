import React, { useState } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [isVisible] = useState(true); // Always visible on this page

  return (
    <div className="analytics-page">
      <div className="analytics-page-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Comprehensive trading analytics and market insights</p>
      </div>
      
      <div className="analytics-page-content">
        <AnalyticsDashboard 
          isVisible={isVisible}
          onClose={() => {}} // No close action on dedicated page
          connection={null} // Mock connection for now
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
