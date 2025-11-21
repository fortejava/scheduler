/**
 * TOOLTIP MANAGER - TIPPY.JS IMPLEMENTATION
 * Manages Tippy.js tooltips for truncated text
 * Provides overlay-style tooltips with expansion animation
 */

const TooltipManager = {
    // Store active tooltip instances
    tippyInstances: [],

    /**
     * Check if element text is truncated
     */
    isTextTruncated: function(element) {
        const isTruncated = element.offsetWidth < element.scrollWidth;
        return isTruncated;
    },

    /**
     * Get full text content for tooltip
     */
    getFullText: function(element) {
        return element.textContent.trim();
    },

    /**
     * Initialize Tippy.js tooltips
     */
    init: function() {
        this.initTippyTooltips();
    },

    /**
     * TIPPY.JS IMPLEMENTATION - POSITIONED OVERLAY
     * Creates tooltip that positions OVER the element and expands horizontally
     */
    initTippyTooltips: function() {
        // Check if Tippy.js is loaded
        if (typeof tippy === 'undefined') {
            console.error('[TooltipManager] Tippy.js not loaded!');
            return;
        }

        // Find all truncated cells
        const truncatedCells = document.querySelectorAll('.text-truncate');
        let count = 0;

        truncatedCells.forEach(cell => {
            // Only add tooltip if text is actually truncated
            if (this.isTextTruncated(cell)) {
                const fullText = this.getFullText(cell);

                // Get cell dimensions for positioning
                const cellWidth = cell.offsetWidth;
                const cellHeight = cell.offsetHeight;

                // Initialize Tippy.js tooltip with overlay positioning
                const tippyInstance = tippy(cell, {
                    content: fullText,
                    theme: 'loginet-overlay',  // Custom overlay theme
                    animation: 'shift-away-subtle',  // Subtle animation
                    placement: 'bottom-start',  // Align with cell start
                    delay: [0, 100],  // [show, hide] - instant show
                    maxWidth: 'none',  // Allow full expansion
                    arrow: false,  // No arrow for overlay effect
                    touch: true,  // Mobile support
                    allowHTML: false,  // Security
                    interactive: false,
                    zIndex: 1000,

                    // Custom offset to position OVER the cell
                    offset: [0, -(cellHeight + 8)],

                    // Lifecycle hooks
                    onCreate(instance) {
                        // Set cell width as CSS variable
                        const popper = instance.popper;
                        popper.style.setProperty('--cell-width', `${cellWidth}px`);
                    },

                    onShow(instance) {
                        // Ensure cell width is set
                        const popper = instance.popper;
                        popper.style.setProperty('--cell-width', `${cellWidth}px`);
                    },

                    onMount(instance) {
                        // Add expanding class for animation
                        const popper = instance.popper;
                        popper.classList.add('tippy-expanding');
                    }
                });

                this.tippyInstances.push({ element: cell, tippy: tippyInstance });
                count++;
            }
        });
    },

    /**
     * Dispose all Tippy.js tooltips
     */
    disposeTippyTooltips: function() {
        this.tippyInstances.forEach(({ element, tippy }) => {
            try {
                if (tippy && typeof tippy.destroy === 'function') {
                    tippy.destroy();
                }
            } catch (e) {
                console.error('[TooltipManager] Error disposing Tippy tooltip:', e);
            }
        });

        this.tippyInstances = [];
    },

    /**
     * Dispose all tooltips
     */
    disposeAll: function() {
        this.disposeTippyTooltips();
    },

    /**
     * Reinitialize tooltips (after table update)
     */
    reinitialize: function() {
        // Dispose old tooltips
        this.disposeAll();

        // Reinitialize
        this.init();
    },

    /**
     * Get current mode (always 'tippy')
     */
    getMode: function() {
        return 'tippy';
    }
};

// ES6 Module Export (Commented out - only works with type="module")
// export { TooltipManager };
