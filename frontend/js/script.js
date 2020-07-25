let globalUsers = [];
let globalCountries = [];
let globalUsersCountries = [];

async function start() {
  await fetchUsers();
  await fetchCountries();

  hideSpinner();
  mergeUsersAndCountries();
  render();
}

async function fetchUsers() {
  const resource = await fetch('http://localhost:3003/users');
  const json = await resource.json();

  globalUsers = json.map(({ dob, login, name, nat, picture }) => {
    return {
      userId: login.uuid,
      userCountry: nat,
      userName: `${name.first} ${name.last}`,
      userPicture: picture.large,
      userAge: dob.age,
    };
  });
}

async function fetchCountries() {
  const resource = await fetch('http://localhost:3001/countries');
  const json = await resource.json();

  globalCountries = json.map(({ alpha2Code, flag, name }) => {
    return {
      countryId: alpha2Code,
      countryFlag: flag,
      countryName: name,
    };
  });
}

function hideSpinner() {
  const spinner = document.querySelector('#spinner');
  spinner.classList.add('hide');
}

function mergeUsersAndCountries() {
  globalUsersCountries = [];

  globalUsers.forEach((user) => {
    const country = globalCountries.find(
      (country) => country.countryId === user.userCountry
    );
    globalUsersCountries.push({
      ...user,
      countryFlag: country.countryFlag,
      countryName: country.countryName,
    });
  });

  console.log(globalUsersCountries);
}

function render() {
  const divUsers = document.querySelector('#users');

  divUsers.innerHTML = `
    <div class='row'>
      ${globalUsersCountries
        .map(({ countryFlag, countryName, userPicture, userName, userAge }) => {
          return `
            <div class='col s6 m4 l3'>
              <div class='flex-row bordered'>
                <img class = 'avatar' src='${userPicture}' alt='${userName}'/>
                <div class='flex-column'>
                  <span>${userName}, ${userAge} years old</span>
                  <img class = 'flag' src='${countryFlag}' alt='${countryName}'/>
                  </div>
                </div>
            </div>
            `;
        })
        .join('')}
    </div>
  `;
}

start();
