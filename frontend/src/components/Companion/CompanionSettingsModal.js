/**
 * COMPANION SETTINGS MODAL - PHASE 9
 * ===================================
 * 
 * PURPOSE: User control panel for companion behavior and preferences
 * FEATURES: Mode selection, lore toggles, avatar customization, statistics
 * ARCHITECTURE: React modal with local storage persistence
 */

import React, { useState, useEffect } from 'react';
import './CompanionSettingsModal.css';

const COMPANION_MODES = {
    ACTIVE: 'active',
    PASSIVE: 'passive',
    OFF: 'off'
};

const LORE_CATEGORIES = {
    MYSTICAL: 'mystical',
    TECHNICAL: 'technical', 
    MOTIVATIONAL: 'motivational',
    HUMOROUS: 'humorous'
};

const CompanionSettingsModal = ({ isOpen, onClose, companionMode, onModeChange, userMetrics }) => {
    // State management for settings modal
    const [avatarType, setAvatarType] = useState(settings.avatar || 'mystical');
    const [debugMode, setDebugMode] = useState(settings.debug || false);

    const [settings, setSettings] = useState({
        avatarStyle: 'moon', // moon, flame, orb, crystal
        loreEnabled: true,
        preferredLore: [LORE_CATEGORIES.MYSTICAL, LORE_CATEGORIES.TECHNICAL],
        messageFrequency: 'normal', // low, normal, high
        hiddenEventsEnabled: true,
        soundEnabled: false,
        animationIntensity: 'normal', // low, normal, high
        idleTimeout: 60, // seconds
        showPredictions: true,
        debugMode: false
    });

    const [stats, setStats] = useState({
        totalMessages: 0,
        favoriteMessageType: 'general',
        companionAge: 0, // days since first activation
        hiddenEventsTriggered: 0
    });

    // 📊 Load settings and stats from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('cult-companion-settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }

        const savedStats = localStorage.getItem('cult-companion-stats');
        if (savedStats) {
            setStats(JSON.parse(savedStats));
        } else {
            // Initialize stats if first time
            const initialStats = {
                totalMessages: 0,
                favoriteMessageType: 'general',
                companionAge: 0,
                hiddenEventsTriggered: 0,
                firstActivated: Date.now()
            };
            localStorage.setItem('cult-companion-stats', JSON.stringify(initialStats));
            setStats(initialStats);
        }
    }, [isOpen]);

    // 💾 Save settings to localStorage
    const saveSettings = (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('cult-companion-settings', JSON.stringify(newSettings));
    };

    // 🎨 Handle avatar style change
    const handleAvatarChange = (newStyle) => {
        saveSettings({ ...settings, avatarStyle: newStyle });
    };

    // 🔧 Handle mode change
    const handleModeChange = (newMode) => {
        onModeChange(newMode);
        localStorage.setItem('cult-companion-mode', newMode);
    };

    // 📚 Handle lore preferences
    const toggleLoreCategory = (category) => {
        const newPreferences = settings.preferredLore.includes(category)
            ? settings.preferredLore.filter(c => c !== category)
            : [...settings.preferredLore, category];
        
        saveSettings({ ...settings, preferredLore: newPreferences });
    };

    // 🧹 Reset companion data
    const resetCompanionData = () => {
        if (window.confirm('Reset all companion data? This cannot be undone.')) {
            localStorage.removeItem('cult-companion-settings');
            localStorage.removeItem('cult-companion-stats');
            localStorage.removeItem('cult-companion-mode');
            localStorage.removeItem('last-checked-xp');
            localStorage.removeItem('last-checked-level');
            localStorage.removeItem('last-checked-dao-votes');
            localStorage.removeItem('last-checked-referrals');
            localStorage.removeItem('last-checked-swaps');
            
            // Reset to defaults
            setSettings({
                avatarStyle: 'moon',
                loreEnabled: true,
                preferredLore: [LORE_CATEGORIES.MYSTICAL, LORE_CATEGORIES.TECHNICAL],
                messageFrequency: 'normal',
                hiddenEventsEnabled: true,
                soundEnabled: false,
                animationIntensity: 'normal',
                idleTimeout: 60,
                showPredictions: true,
                debugMode: false
            });
            
            handleModeChange(COMPANION_MODES.ACTIVE);
        }
    };

    // 📈 Calculate companion age in days
    const companionAge = stats.firstActivated 
        ? Math.floor((Date.now() - stats.firstActivated) / (24 * 60 * 60 * 1000))
        : 0;

    if (!isOpen) return null;

    return (
        <div className="companion-settings-overlay" onClick={onClose}>
            <div className="companion-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🌙 Cult Companion Settings</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    {/* 🎭 Avatar & Mode Selection */}
                    <section className="settings-section">
                        <h3>🎭 Companion Appearance</h3>
                        
                        <div className="setting-group">
                            <label>Avatar Style</label>
                            <div className="avatar-selector">
                                {['moon', 'flame', 'orb', 'crystal'].map(style => (
                                    <button
                                        key={style}
                                        className={`avatar-option ${settings.avatarStyle === style ? 'selected' : ''}`}
                                        onClick={() => handleAvatarChange(style)}
                                    >
                                        {style === 'moon' && '🌙'}
                                        {style === 'flame' && '🔥'}
                                        {style === 'orb' && '🔮'}
                                        {style === 'crystal' && '💎'}
                                        <span>{style}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-group">
                            <label>Companion Mode</label>
                            <div className="mode-selector">
                                {Object.values(COMPANION_MODES).map(mode => (
                                    <button
                                        key={mode}
                                        className={`mode-option ${companionMode === mode ? 'selected' : ''}`}
                                        onClick={() => handleModeChange(mode)}
                                    >
                                        {mode === 'active' && '🌟 Active'}
                                        {mode === 'passive' && '🌙 Passive'}
                                        {mode === 'off' && '💤 Off'}
                                        <small>
                                            {mode === 'active' && 'Full guidance & predictions'}
                                            {mode === 'passive' && 'Minimal notifications only'}
                                            {mode === 'off' && 'Companion disabled'}
                                        </small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 📚 Lore & Personality */}
                    <section className="settings-section">
                        <h3>📚 Personality & Lore</h3>
                        
                        <div className="setting-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.loreEnabled}
                                    onChange={(e) => saveSettings({ ...settings, loreEnabled: e.target.checked })}
                                />
                                Enable lore and narrative elements
                            </label>
                        </div>

                        {settings.loreEnabled && (
                            <div className="setting-group">
                                <label>Preferred Lore Categories</label>
                                <div className="lore-categories">
                                    {Object.entries(LORE_CATEGORIES).map(([key, category]) => (
                                        <button
                                            key={category}
                                            className={`lore-option ${settings.preferredLore.includes(category) ? 'selected' : ''}`}
                                            onClick={() => toggleLoreCategory(category)}
                                        >
                                            {category === 'mystical' && '🔮 Mystical'}
                                            {category === 'technical' && '⚙️ Technical'}
                                            {category === 'motivational' && '💪 Motivational'}
                                            {category === 'humorous' && '😄 Humorous'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="setting-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.hiddenEventsEnabled}
                                    onChange={(e) => saveSettings({ ...settings, hiddenEventsEnabled: e.target.checked })}
                                />
                                Enable rare hidden events (1-5% chance)
                            </label>
                        </div>
                    </section>

                    {/* ⚙️ Behavior Settings */}
                    <section className="settings-section">
                        <h3>⚙️ Behavior Settings</h3>
                        
                        <div className="setting-group">
                            <label>Message Frequency</label>
                            <select
                                value={settings.messageFrequency}
                                onChange={(e) => saveSettings({ ...settings, messageFrequency: e.target.value })}
                            >
                                <option value="low">Low (Important only)</option>
                                <option value="normal">Normal (Balanced)</option>
                                <option value="high">High (Chatty)</option>
                            </select>
                        </div>

                        <div className="setting-group">
                            <label>Idle Timeout (seconds)</label>
                            <input
                                type="range"
                                min="30"
                                max="300"
                                value={settings.idleTimeout}
                                onChange={(e) => saveSettings({ ...settings, idleTimeout: parseInt(e.target.value) })}
                            />
                            <span>{settings.idleTimeout}s</span>
                        </div>

                        <div className="setting-group">
                            <label>Animation Intensity</label>
                            <select
                                value={settings.animationIntensity}
                                onChange={(e) => saveSettings({ ...settings, animationIntensity: e.target.value })}
                            >
                                <option value="low">Low (Performance mode)</option>
                                <option value="normal">Normal (Balanced)</option>
                                <option value="high">High (Full effects)</option>
                            </select>
                        </div>

                        <div className="setting-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.showPredictions}
                                    onChange={(e) => saveSettings({ ...settings, showPredictions: e.target.checked })}
                                />
                                Show AI predictions and suggestions
                            </label>
                        </div>
                    </section>

                    {/* 📊 Statistics */}
                    <section className="settings-section">
                        <h3>📊 Companion Statistics</h3>
                        
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Companion Age</span>
                                <span className="stat-value">{companionAge} days</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Total Messages</span>
                                <span className="stat-value">{stats.totalMessages}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Hidden Events</span>
                                <span className="stat-value">{stats.hiddenEventsTriggered}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Your XP</span>
                                <span className="stat-value">{userMetrics.xp}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Your Level</span>
                                <span className="stat-value">{userMetrics.level}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">DAO Votes</span>
                                <span className="stat-value">{userMetrics.daoVotes}</span>
                            </div>
                        </div>
                    </section>

                    {/* 🧹 Advanced Options */}
                    <section className="settings-section">
                        <h3>🧹 Advanced Options</h3>
                        
                        <div className="setting-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.debugMode}
                                    onChange={(e) => saveSettings({ ...settings, debugMode: e.target.checked })}
                                />
                                Enable debug mode (console logging)
                            </label>
                        </div>

                        <button 
                            className="reset-button"
                            onClick={resetCompanionData}
                        >
                            🔄 Reset All Companion Data
                        </button>
                    </section>
                </div>

                <div className="modal-footer">
                    <button className="primary-button" onClick={onClose}>
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanionSettingsModal;

// 🌐 Global exports for vanilla JS integration
window.CompanionSettingsModal = CompanionSettingsModal;
