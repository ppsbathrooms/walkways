$('.header').html(
`<div class="navbar fv">
    <div class="logo">
        <h1>ppsbathrooms</h1>
    </div>
    <div class="flex">
        <p id="user-info" style="margin-right: 20px"></p>
        <img class="icon" id="settings-icon" src="/style/icons/settings.svg" alt="settings">
        <div class="signIn fh fv" id="signInButton">sign in</div>
        <div class="signIn fh fv" id="signOutButton" style="display: none">
        sign out
        </div>
    </div>
</div>`);

$('#settings-icon').on('click', e => {
    alert('cool settings page woohoo')
})

$("#signInButton").on("click", (e) => {
    window.location = "/auth/google";
});

$("#signOutButton").on("click", (e) => {
    window.location = "/logout";
});

$(".logo").on("click", (e) => {
    if(window.location.pathname != '/')
        window.location = "/";
});
