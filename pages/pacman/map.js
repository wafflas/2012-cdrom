/**
 * Map configuration for Cyberpunk Pac-Man
 * Contains maps for multiple levels with increasing difficulty
 * Map legend:
 * 0 - Empty space
 * 1 - Wall
 * 2 - Dot
 * 3 - Empty (previously had dot)
 * 4 - Power pellet
 */

const MAP_CONFIG = (function() {
    // Base map template (21 columns x 23 rows)
    const baseMap = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 4, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 4, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 0, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 0, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 4, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 4, 1],
        [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
    
    // Additional maps for different levels
    const levelMaps = [
        // Level 1 - Standard map (unchanged)
        baseMap.map(row => [...row]),
        
        // Level 2 - Diagonal barriers
        baseMap.map((row, rowIndex) => {
            const newRow = [...row];
            // Add diagonal barriers in the center
            if (rowIndex >= 6 && rowIndex <= 16) {
                // Left diagonal
                if (rowIndex >= 8 && rowIndex <= 14) {
                    const leftPos = 10 - rowIndex;
                    if (leftPos > 1 && leftPos < 19 && newRow[leftPos] === 2) {
                        newRow[leftPos] = 1;
                    }
                }
                // Right diagonal
                if (rowIndex >= 8 && rowIndex <= 14) {
                    const rightPos = rowIndex + 2;
                    if (rightPos > 1 && rightPos < 19 && newRow[rightPos] === 2) {
                        newRow[rightPos] = 1;
                    }
                }
            }
            return newRow;
        }),
        
        // Level 3 - Checkerboard pattern in open areas
        baseMap.map((row, rowIndex) => {
            const newRow = [...row];
            // Apply checkerboard to open areas
            for (let col = 1; col < newRow.length - 1; col++) {
                if (newRow[col] === 2 && (rowIndex + col) % 2 === 0) {
                    newRow[col] = 1;
                }
            }
            // Keep power pellets
            newRow[1] = row[1];
            newRow[19] = row[19];
            return newRow;
        }),
        
        // Level 4 - Maze-like inner structure
        baseMap.map((row, rowIndex) => {
            const newRow = [...row];
            // Vertical barriers
            if (rowIndex >= 5 && rowIndex <= 17) {
                for (let col = 3; col <= 17; col += 7) {
                    if (newRow[col] === 2) newRow[col] = 1;
                }
            }
            // Horizontal barriers
            if (rowIndex === 7 || rowIndex === 9 || rowIndex === 13 || rowIndex === 15) {
                for (let col = 5; col <= 15; col++) {
                    if (newRow[col] === 2) newRow[col] = 1;
                }
            }
            // Keep some paths open
            if (rowIndex === 8 || rowIndex === 14) {
                newRow[10] = 2;
                newRow[12] = 2;
            }
            return newRow;
        }),
        
        // Level 5 - Most challenging with spiral pattern
        baseMap.map((row, rowIndex) => {
            const newRow = [...row];
            // Spiral pattern walls
            if (rowIndex === 6 || rowIndex === 16) {
                for (let col = 4; col <= 16; col++) {
                    if (col !== 10 && newRow[col] === 2) newRow[col] = 1;
                }
            }
            if (rowIndex === 8 || rowIndex === 14) {
                for (let col = 6; col <= 14; col++) {
                    if (col !== 10 && newRow[col] === 2) newRow[col] = 1;
                }
            }
            if (rowIndex === 10 || rowIndex === 12) {
                for (let col = 8; col <= 12; col++) {
                    if (col !== 10 && newRow[col] === 2) newRow[col] = 1;
                }
            }
            // Vertical connectors
            for (let col = 4; col <= 16; col += 12) {
                if (rowIndex >= 6 && rowIndex <= 16 && newRow[col] === 2) {
                    newRow[col] = 1;
                }
            }
            for (let col = 6; col <= 14; col += 8) {
                if (rowIndex >= 8 && rowIndex <= 14 && newRow[col] === 2) {
                    newRow[col] = 1;
                }
            }
            for (let col = 8; col <= 12; col += 4) {
                if (rowIndex >= 10 && rowIndex <= 12 && newRow[col] === 2) {
                    newRow[col] = 1;
                }
            }
            return newRow;
        })
    ];
    
    // Current active map
    let currentMap = levelMaps[0].map(row => [...row]);
    
    return {
        // Get the current map
        get map() {
            return currentMap;
        },
        
        // Set map to specific level (1-based index)
        setLevel: function(level) {
            const levelIndex = Math.min(Math.max(level - 1, 0), levelMaps.length - 1);
            currentMap = levelMaps[levelIndex].map(row => [...row]);
            return currentMap;
        },
        
        // Reset the current map (for new game or after level clear)
        resetMap: function() {
            const currentLevel = Math.min(CYBERPACMAN.getGameSettings().currentLevel || 1, levelMaps.length);
            return this.setLevel(currentLevel);
        },
        
        // Get map dimensions
        getDimensions: function() {
            return {
                rows: currentMap.length,
                cols: currentMap[0].length
            };
        }
    };
})();