/**
 * AUTO-INITIALIZATION FOR NOCTURNE PARTICLE SYSTEM
 * ================================================
 * 
 * PURPOSE: Automatically initialize the particle system with proper timing
 * FEATURES: Smart detection, automatic startup, error handling
 * INTEGRATION: Seamless integration with existing app lifecycle
 */

// Auto-initialize particle system when scripts are loaded
(function() {
    'use strict';
    
    console.log('🎨 Nocturne Particle Auto-Init loaded');
    
    let initializationAttempted = false;
    
    /**
     * Initialize particle system with proper timing
     */
    function initializeParticleSystem() {
        if (initializationAttempted) {
            console.log('🎨 Particle system already initialized');
            return;
        }
        
        initializationAttempted = true;
        
        try {
            // Check if required classes are available
            if (typeof ParticleSystemManager === 'undefined') {
                console.warn('⚠️ ParticleSystemManager not yet available, retrying...');
                setTimeout(initializeParticleSystem, 500);
                initializationAttempted = false;
                return;
            }
            
            // Initialize the enhanced particle system
            window.nocturneParticleManager = new ParticleSystemManager();
            console.log('✅ Nocturne Particle System Auto-Init successful');
            
        } catch (error) {
            console.error('❌ Particle system initialization failed:', error);
            
            // Fallback: Try again after a delay
            setTimeout(() => {
                initializationAttempted = false;
                initializeParticleSystem();
            }, 2000);
        }
    }
    
    /**
     * Smart initialization timing
     */
    function startInitialization() {
        // Immediate attempt if DOM is ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(initializeParticleSystem, 100);
        }
        
        // Fallback listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initializeParticleSystem, 200);
            });
        }
        
        // Final fallback
        window.addEventListener('load', () => {
            setTimeout(initializeParticleSystem, 300);
        });
    }
    
    // Start the initialization process
    startInitialization();
    
    // Expose global function for manual initialization
    window.initializeNocturneParticles = initializeParticleSystem;
    
})();
