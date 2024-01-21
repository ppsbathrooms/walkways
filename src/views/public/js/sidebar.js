var sidebarOpen;

$('.sidebar').html(`
    <div class="sidebar-content" id="sidebar-content">
        <div class="sidebar-toggle"><span class="material-symbols-outlined" id="sidebar-toggle-button">keyboard_double_arrow_left</span></div>

        <p>Epic sidebar</p>
        <p>woohoo</p>
    </div>
`)

$(".sidebar-toggle").on('click', e => {
    sidebarOpen = !sidebarOpen;
    $(".sidebar").animate({
      right: sidebarOpen ? '0px' : '-240px'
    }, 400);

    $(".nav-buttons").animate({
      right: sidebarOpen ? '260px' : '20px'
    }, 400);

    $('#sidebar-toggle-button').animate({rotate: sidebarOpen ? '180deg' : '0deg'}, 200);
});