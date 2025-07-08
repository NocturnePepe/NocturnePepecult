import React, { useState } from 'react';
import ReferralSystem from '../components/ReferralSystem';
import './ReferralPage.css';

const ReferralPage = () => {
  const [isVisible] = useState(true); // Always visible on this page

  return (
    <div className="referral-page">
      <div className="referral-page-header">
        <h1>🚀 Referral Program</h1>
        <p>Earn rewards by bringing new members to the cult</p>
      </div>
      
      <div className="referral-page-content">
        <ReferralSystem 
          isVisible={isVisible} 
          onClose={() => {}} // No close action on dedicated page
        />
      </div>
    </div>
  );
};

export default ReferralPage;
