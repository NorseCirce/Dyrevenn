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



document.addEventListener("DOMContentLoaded", function() {
    const toggleBtn = document.querySelector("#toggle-sponsor-list .toggle-btn");
    const sponsorList = document.querySelector("#toggle-sponsor-list .sponsor-list");

    toggleBtn.addEventListener("click", function() {
        if (sponsorList.classList.contains("show")) {
            sponsorList.style.maxHeight = sponsorList.scrollHeight + "px"; // Set to current height for smooth transition
            setTimeout(() => {
                sponsorList.classList.remove("show");
                sponsorList.style.maxHeight = "0"; // Collapse smoothly
                toggleBtn.textContent = '▼';
            }, 10); // Small timeout to apply the height before collapsing
        } else {
            sponsorList.classList.add("show");
            sponsorList.style.maxHeight = sponsorList.scrollHeight + "px"; // Expand smoothly
            toggleBtn.textContent = '►';
        }
    });
});





