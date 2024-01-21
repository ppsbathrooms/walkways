var options = [
    {
        name: 'Settings',
        content: `
        <h1>Settings</h1>
        <p>Prefered Name: ${user ? user.given_name: ''}</p>
        <p>Email: ${user ? user.email : ''}</p>
        <div id="close-settings-button"><p>Save</p></div>
        `
    },
    {
        name: 'Preferences',
        content: `
        <h1>Preferences</h1>
        <p>Imagine there are lots of user preferences here, you\'re welcome.</p>
        <p>woohoo</p>
        `
    }
];

let navbar;
let settingsPanels;

const formattedOptions = options.map(option => option.name.replace(/\s+/g, '-'));

navbar = formattedOptions.map((option, index) => `<p class="navbar-option" data-option="${option}">${options[index].name}</p>`).join('');

settingsPanels = formattedOptions.map(option => {
    const optionObj = options.find(opt => opt.name.replace(/\s+/g, '-') === option);
    return `<div id="account-${option}" class="settingsPanel ">${optionObj.content}</div>`;
}).join('');

$('.settingsHolder').html(
    `<div class="settings">
      <div class="settingsNavbar">
        ${navbar}
      </div>
      <div class="settingsPanels">
        ${settingsPanels}
      </div>
    </div>`
);

$('.settingsPanel').first().addClass('activeSetting');

$('.navbar-option').on('click', function() {
    const selectedOption = $(this).data('option');
    $('.settingsPanel').removeClass('activeSetting');
    $(`#account-${selectedOption}`).addClass('activeSetting');
});

$('#close-settings-button').on('click', e => {
    hideSettings();
})

function showSettings() {
    $('#content-fade').fadeIn(100);
    $('.settingsHolder').css('display', 'flex').hide().fadeIn(200);
    $('#user-dropdown').fadeOut(100);
}

function hideSettings() {
    $('#content-fade').fadeOut(100);
    $('.settingsHolder').fadeOut(200)
}

$('#content-fade').on('click', e => {
    hideSettings();
})