/**
 * Brick Simulation Game - Text Renderer
 * Handles text rendering with different styles and effects
 */

class TextRenderer {
    /**
     * Creates a new text renderer
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.defaultFont = CONFIG.FONT_FAMILY;
        this.defaultColor = CONFIG.COLOR_WHITE;
        this.shadowColor = "rgba(0, 0, 0, 0.7)";
        this.shadowOffsetX = 2;
        this.shadowOffsetY = 2;
        this.shadowBlur = 3;
    }
    
    /**
     * Draws text with specified parameters
     * @param {string} text - The text to draw
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {Object} options - Options for text rendering
     */
    drawText(text, x, y, options = {}) {
        const {
            fontSize = 16,
            color = this.defaultColor,
            align = 'left',
            baseline = 'top',
            shadow = true,
            fontWeight = 'normal',
            fontStyle = 'normal',
            fontFamily = this.defaultFont
        } = options;
        
        this.ctx.save();
        
        // Set text properties
        this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        
        // Apply shadow if enabled
        if (shadow) {
            this.ctx.shadowColor = this.shadowColor;
            this.ctx.shadowOffsetX = this.shadowOffsetX;
            this.ctx.shadowOffsetY = this.shadowOffsetY;
            this.ctx.shadowBlur = this.shadowBlur;
        }
        
        // Draw the text
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
    }
    
    /**
     * Draws text with a stroke outline
     * @param {string} text - The text to draw
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {Object} options - Options for text rendering
     */
    drawOutlinedText(text, x, y, options = {}) {
        const {
            fontSize = 16,
            fillColor = this.defaultColor,
            strokeColor = '#000000',
            strokeWidth = 3,
            align = 'left',
            baseline = 'top',
            fontWeight = 'normal',
            fontStyle = 'normal',
            fontFamily = this.defaultFont
        } = options;
        
        this.ctx.save();
        
        // Set text properties
        this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        
        // Draw the stroke
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeText(text, x, y);
        
        // Draw the fill
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
    }
    
    /**
     * Draws flashing/blinking text
     * @param {string} text - The text to draw
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} time - The current time for animation
     * @param {Object} options - Options for text rendering
     */
    drawFlashingText(text, x, y, time, options = {}) {
        const {
            fontSize = 16,
            color = this.defaultColor,
            flashRate = 500, // milliseconds
            align = 'left',
            baseline = 'top',
            fontWeight = 'normal',
            fontFamily = this.defaultFont
        } = options;
        
        // Calculate flashing effect
        const visible = Math.floor(time / flashRate) % 2 === 0;
        
        if (visible) {
            this.drawText(text, x, y, {
                fontSize,
                color,
                align,
                baseline,
                fontWeight,
                fontFamily
            });
        }
    }
    
    /**
     * Draws text that pulses in size
     * @param {string} text - The text to draw
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {number} time - The current time for animation
     * @param {Object} options - Options for text rendering
     */
    drawPulsingText(text, x, y, time, options = {}) {
        const {
            fontSize = 16,
            color = this.defaultColor,
            pulseRate = 1000, // milliseconds for a complete pulse cycle
            pulseScale = 0.2, // max 20% increase in size
            align = 'left',
            baseline = 'top',
            fontWeight = 'normal',
            fontFamily = this.defaultFont
        } = options;
        
        // Calculate pulse effect (sine wave)
        const pulseFactor = 1 + pulseScale * Math.sin((time % pulseRate) / pulseRate * Math.PI * 2);
        const adjustedSize = Math.floor(fontSize * pulseFactor);
        
        this.drawText(text, x, y, {
            fontSize: adjustedSize,
            color,
            align,
            baseline,
            fontWeight,
            fontFamily
        });
    }
    
    /**
     * Draws localized text using the current game language
     * @param {string} key - The key for the localized text in CONFIG.LANGUAGES
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     * @param {Object} options - Options for text rendering
     */
    drawLocalizedText(key, x, y, options = {}) {
        // Get the translated text from the configuration
        const text = getText(key);
        this.drawText(text, x, y, options);
    }
    
    /**
     * Measures the width of text with the given options
     * @param {string} text - The text to measure
     * @param {Object} options - Options for text rendering
     * @returns {number} The width of the text in pixels
     */
    measureText(text, options = {}) {
        const {
            fontSize = 16,
            fontWeight = 'normal',
            fontStyle = 'normal',
            fontFamily = this.defaultFont
        } = options;
        
        this.ctx.save();
        this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        const width = this.ctx.measureText(text).width;
        this.ctx.restore();
        
        return width;
    }
}
