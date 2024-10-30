// Ensure the code runs after the DOM is fully loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Get the reviews container element by its ID
        const reviewsContainer = document.getElementById('reviews-container'); 

        // Create a wrapper div for scrollable reviews and style it
        const scrollableContainer = document.createElement('div');
        scrollableContainer.style.maxHeight = '400px'; // Set the max height for the container
        scrollableContainer.style.overflowY = 'auto';   // Enable vertical scrolling
        scrollableContainer.style.border = '1px solid #ccc'; 
        scrollableContainer.style.padding = '10px';     

        // Move the existing reviews into this new scrollable container
        while (reviewsContainer.firstChild) {
            scrollableContainer.appendChild(reviewsContainer.firstChild);
        }

        // Append the scrollable container back to the reviews container
        reviewsContainer.appendChild(scrollableContainer);
    });
}