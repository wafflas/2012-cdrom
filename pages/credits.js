// Simple credits animation script
document.addEventListener("DOMContentLoaded", function() {
    console.log("Credits script loaded");
    
    const creditsConsole = document.getElementById("credits-console");
    
    // Only run if we're on the credits page with the proper elements
    if (creditsConsole && typeof creditsData !== "undefined") {
        // Clear initial placeholder text
        creditsConsole.innerHTML = "";
        
        // Make sure the terminal fills the minidisc layout
        const terminalOutput = document.querySelector(".terminal-output");
        const minidiscLayout = document.querySelector(".minidisc-layout");
        
        if (terminalOutput) {
            // Make terminal fill the available space
            terminalOutput.style.height = "calc(100% - 80px)";
            terminalOutput.style.overflowY = "auto";
        }
        
        // Add sci-fi border to minidisc layout
        if (minidiscLayout) {
            minidiscLayout.style.border = "2px solid #00e6ff";
            minidiscLayout.style.boxShadow = "0 0 15px #00e6ff, inset 0 0 10px rgba(0, 230, 255, 0.5)";
        }
        
        // Set up typing variables
        let currentLine = 0;
        
        // Simple typing animation
        let typingTimer = setInterval(function() {
            if (currentLine < creditsData.length) {
                const line = document.createElement("div");
                line.className = "console-line";
                
                // Add special styling for different line types
                if (creditsData[currentLine].includes(">>>")) {
                    line.style.color = "#00ff77";
                    line.style.textShadow = "0 0 5px #00ff77";
                } else if (creditsData[currentLine].includes("===")) {
                    line.style.color = "#00ccff";
                    line.style.fontWeight = "bold";
                }
                
                line.textContent = creditsData[currentLine];
                creditsConsole.appendChild(line);
                currentLine++;
                
                // Auto-scroll to keep current line visible
                if (terminalOutput) {
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            } else {
                // Reset and start over
                clearInterval(typingTimer);
                setTimeout(function() {
                    creditsConsole.innerHTML = "";
                    currentLine = 0;
                    typingTimer = setInterval(arguments.callee, 100);
                }, 5000);
            }
        }, 500);
    }
});
