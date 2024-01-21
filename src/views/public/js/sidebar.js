var sidebarOpen;

document.querySelector(".sidebar-toggle").addEventListener("click", () => {
    sidebarOpen = !sidebarOpen;

    document.getElementById("sidebar-content").style.display = sidebarOpen ? "block" : "none";
    document.getElementById("sidebar-open-button").style.display = sidebarOpen ? "none" : "block";
    document.getElementById("sidebar-close-button").style.display = sidebarOpen ? "block" : "none";
});