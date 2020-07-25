let globalUsers = [];
let globalCountries = [];
let globalUsersCountries = [];

async function start() {
  //Normal
  //await fetchUsers();
  //await fetchCountries();

  //Sequencial promise
  //console.time('promise');
  //await promiseUsers();
  //await promiseCountries();
  //console.timeEnd('promise');

  //Primise "parallel"
  console.time('promiseParallel');
  const p1 = promiseUsers();
  const p2 = promiseCountries();
  await Promise.all([p1, p2]);
  console.timeEnd('promiseParallel');

  hideSpinner();
  mergeUsersAndCountries();
  render();
}

function promiseUsers() {
  return new Promise(async (resolve, reject) => {
    const users = await fetchUsers();

    setTimeout(() => {
      console.log('primeseUsers resolvida');
      resolve(users);
    }, 3000);
  });
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

function promiseCountries() {
  return new Promise(async (resolve, reject) => {
    const countries = await fetchCountries();

    setTimeout(() => {
      console.log('promeseCountries resolvida');
      resolve(countries);
    }, 2000);
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
                  <span>${userName}</span>
                  <span>${userAge} years old</span>
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
