var options = [
    {
        name: 'Preferences',
        content: `
        <h1>Preferences</h1>
        <div class="fv">
            <h2>theme</h2>
            <label class="switch">
                <input type="checkbox">
                <span class="slider round"></span>
            </label>
        </div>
        <h2>school</h2>
        <div class="school-select">
            <select>
                <option>cleveland</option>
                <option>franklin</option>
            </select>
        </div><br>
        <h2>schedule</h2>
        <div class="schedule-holder">
            <div class="schedule-column">
                <div>
                    <p>1</p>
                    <input class="text-box" type="text" value="">                
                </div>
                <div>
                    <p>2</p>
                    <input class="text-box" type="text" value="">                
                </div>
                <div>
                    <p>3</p>
                    <input class="text-box" type="text" value="">                
                </div>
                <div>
                    <p>4</p>
                    <input class="text-box" type="text" value="">                
                </div>
            </div>
            <div class="schedule-column">
                <div>
                    <p>5</p>
                    <input class="text-box" type="text" value="">                
                </div>
                <div>
                    <p>6</p>
                    <input class="text-box" type="text" value="">                
                </div>
                <div>
                    <p>7</p>
                    <input class="text-box" type="text" value="">                
                </div>
                <div>
                    <p>8</p>
                    <input class="text-box" type="text" value="">                
                </div>
            </div>
        </div>
        <br>
        <h2>bathroom preference</h2>
        <div class="br-prefs">
            <div>
                <input class="check-box" type="checkbox">
                <p>male</p>
            </div>
            <div>
                <input class="check-box" type="checkbox">
                <p>female</p>
            </div>
            <div>
                <input class="check-box" type="checkbox" checked>
                <p>all gender</p>
            </div>
        </div>
        <div style="height: 50px;"></div>
        `
    },
    {
        name: 'Settings',
        content: `
        <h1>Settings</h1>
        <div class="fv">
            <p>Preffered Name: </p>
            <input class="text-box ml-10" type="text" value="${user ? user.given_name : ''}" maxlength="20" ></input>
        </div>

        <p>Email: ${user ? user.email : ''}</p>
        `
    },
];

let navbar;
let settingsPanels;

const formattedOptions = options.map(option => option.name.replace(/\s+/g, '-'));

navbar = formattedOptions.map((option, index) => `<p class="navbar-option" data-option="${option}">${options[index].name}</p>`).join('');

settingsPanels = formattedOptions.map(option => {
    const optionObj = options.find(opt => opt.name.replace(/\s+/g, '-') === option);
    return `<div id="account-${option}" class="settingsPanel ">${optionObj.content}<div id="close-settings-button"><p>Save</p></div></div>`;
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