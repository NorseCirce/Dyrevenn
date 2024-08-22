document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const wrapper = document.querySelector('.wrapper');
    const toTopBtn = document.getElementById("toTopBtn");

    // Disable automatic scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Check if a scroll position is saved in localStorage
    const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
        console.log('Restoring scroll position:', savedScrollPosition);
        // Directly set the scroll position without delay
        wrapper.scrollTop = parseInt(savedScrollPosition, 10);
    }

    // Save the scroll position before the page is unloaded
    window.addEventListener('beforeunload', saveScrollPosition);

    // Get the maxBottom value from the data attribute
    const maxBottomFactor = parseFloat(wrapper.getAttribute('data-max-bottom'));

    // Show the button after scrolling down 20px from the top of the document
    wrapper.addEventListener('scroll', function() {
        if (wrapper.scrollTop > 20) {
            toTopBtn.style.display = "block";
        } else {
            toTopBtn.style.display = "none";
        }

        // Prevent the button from going lower than 10vw from the bottom of the page
        const scrollBottom = wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop;
        const maxBottom = window.innerHeight * maxBottomFactor;
        if (scrollBottom < maxBottom) {
            toTopBtn.style.bottom = `${maxBottom - scrollBottom}px`;
        } else {
            toTopBtn.style.bottom = '20px';
        }
    });

    // Attach the scrollToTop function to the button's click event
    toTopBtn.addEventListener('click', scrollToTop);
});

// Function to save scroll position
function saveScrollPosition() {
    const wrapper = document.querySelector('.wrapper');
    const scrollPosition = wrapper.scrollTop;
    console.log('Saving scroll position:', scrollPosition);
    localStorage.setItem('scrollPosition', scrollPosition);
}

// Function to scroll to the top of the document with a gradual transition
function scrollToTop() {
    const wrapper = document.querySelector('.wrapper');
    const scrollDuration = 1500; // Duration of the scroll in milliseconds
    const scrollStep = -wrapper.scrollTop / (scrollDuration / 15);

    function smoothScroll() {
        if (wrapper.scrollTop !== 0) {
            wrapper.scrollBy(0, scrollStep);
            requestAnimationFrame(smoothScroll);
        }
    }

    // Temporarily disable saving the scroll position to localStorage during the scroll
    window.removeEventListener('beforeunload', saveScrollPosition);
    smoothScroll();
    // Re-enable saving the scroll position after the scroll is complete
    setTimeout(() => {
        window.addEventListener('beforeunload', saveScrollPosition);
    }, scrollDuration);
}


// Dark mode?
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});