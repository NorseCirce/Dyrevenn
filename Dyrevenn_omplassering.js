console.log("Script loaded");

function openVipps() {
    window.location.href = "vipps://570826";
}

function openModal() {
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

window.onclick = function(event) {
    if (event.target == document.getElementById("myModal")) {
        closeModal();
    }
}

// Get the button
let mybutton = document.getElementById("toTopBtn");

if (!mybutton) {
    console.log("Button not found");
} else {
    console.log("Button found");
}

// Add the scroll event listener using only one method
window.addEventListener('scroll', function() {
    console.log("Scroll event fired (addEventListener)");
    scrollFunction();
});

// Directly call scrollFunction to check initial state
document.addEventListener('DOMContentLoaded', function() {
    scrollFunction();

    // Manually trigger scroll event for testing
    window.dispatchEvent(new Event('scroll'));

    // Function to force scroll the page for testing
    function forceScroll() {
        console.log("Forcing scroll...");
        window.scrollTo(0, 200);
    }

    // Call forceScroll to ensure the page scrolls
    setTimeout(forceScroll, 1000);
});

function scrollFunction() {
    console.log("Scroll function called");
    console.log("document.body.scrollTop:", document.body.scrollTop);
    console.log("document.documentElement.scrollTop:", document.documentElement.scrollTop);
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        console.log("Showing button");
        mybutton.style.display = "block";
    } else {
        console.log("Hiding button");
        mybutton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
