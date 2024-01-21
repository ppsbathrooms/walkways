$('.header').html(
`<div class="navbar fv">
    <div class="logo">
        <h1>ppsbathrooms</h1>
    </div>
    <div class="flex fv">
        <div class="signIn fh fv" id="sign-in-button">sign in</div>
        <img id="user-photo" src=""></img>
        <div id="user-dropdown">
            <p id="settings-button" >settings</p>
            <p id="sign-out-button">sign out</p>
        </div>
    </div>
</div>`);

$('#settings-button').on('click', e => {
    alert('cool settings page woohoo')
})

$("#sign-in-button").on("click", (e) => {
    window.location = "/auth/google";
});

$("#sign-out-button").on("click", (e) => {
    window.location = "/logout";
});

$(".logo").on("click", (e) => {
    if(window.location.pathname != '/')
        window.location = "/";
});

const { isAuthenticated, user } = JSON.parse($('#data').html());

if (isAuthenticated) {
  $("#sign-in-button").hide();
  if (user) {
    $("#user-info").html(`${user.displayName} - ${user.email}`);
    $("#user-photo").attr("src",user.photo);
    $('#user-photo').fadeIn(100);
}
} else {
  $("#sign-in-button").show();
}

$('#user-photo').on('click', e => {
    $('#user-dropdown').fadeToggle(100);
})