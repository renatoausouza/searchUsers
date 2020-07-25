let globalUsers = [];
let globalCountries = [];
let globalUsersCountries = [];
let globalFilteredUsersCountries = [];

let numberFilteredUsers = 0;
let numberMans = 0;
let numberWomens = 0;
let sumAges = 0;
let averageAge = 0;

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
  renderStatistics();
  render();
  captureEvent();
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

  globalUsers = json.map(({ dob, login, name, nat, picture, gender }) => {
    return {
      userId: login.uuid,
      userCountry: nat,
      userName: `${name.first} ${name.last}`,
      userPicture: picture.large,
      userAge: dob.age,
      userGender: gender,
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

  globalUsersCountries.sort((a, b) => a.userName.localeCompare(b.userName));

  globalFilteredUsersCountries = [...globalUsersCountries];
}

function captureEvent() {
  captureButtonEvent();
  captureEnterKeyEvent();
}

function captureButtonEvent() {
  const buttonFilter = document.querySelector('#buttonFilter');
  buttonFilter.addEventListener('click', handleFiler);
}

function captureEnterKeyEvent() {
  const inputFilter = document.querySelector('#inputFilter');
  inputFilter.addEventListener('keyup', handleFilterKeyUp);
}

function handleFiler(event) {
  const inputFilter = document.querySelector('#inputFilter');
  const filterValuer = inputFilter.value.toLowerCase();

  globalFilteredUsersCountries = globalUsersCountries.filter((item) => {
    return item.userName.toLowerCase().includes(filterValuer);
  });

  render();
  renderStatistics();
}

function handleFilterKeyUp(event) {
  const { key } = event;
  if (key !== 'Enter') {
    return;
  }
  handleFiler();
}

function render() {
  const divUsers = document.querySelector('#users');

  divUsers.innerHTML = `
    <div class='row'>
    <h2>${numberFilteredUsers} user(s) found.</h2>
      ${globalFilteredUsersCountries
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

function renderStatistics() {
  const divStatistics = document.querySelector('#statistics');

  numberMans = calculateNumberOfMens();
  numberWomens = calculateNumberOfWomens();
  sumAges = calculateSumOfAges();
  numberFilteredUsers = calculateNumberFilteredUsers();
  averageAge = calculateAvarageAge();

  divStatistics.innerHTML = `
    <div class='flex-column'>
      <h2>Statistics</h2>
      <span class="statistic-span">Male: ${numberMans}</span>
      <span class="statistic-span">Female: ${numberWomens}</span>
      <span class="statistic-span">Sum of ages: ${sumAges}</span>
      <span class="statistic-span">Average of ages: ${averageAge}</span>
    </div>
  `;
  render();
}

function calculateNumberOfMens() {
  let filteredMens = globalFilteredUsersCountries.filter(
    (item) => item.userGender === 'male'
  );
  return filteredMens.length;
}

function calculateNumberOfWomens() {
  let filteredWomens = globalFilteredUsersCountries.filter(
    (item) => item.userGender === 'female'
  );
  return filteredWomens.length;
}

function calculateSumOfAges() {
  let sum = 0;
  globalFilteredUsersCountries.forEach((item) => {
    sum = sum + item.userAge;
  });
  return sum;
}

function calculateAvarageAge() {
  let sum = 0;
  let avarage = 0;
  globalFilteredUsersCountries.forEach((item) => {
    sum = sum + item.userAge;
  });
  avarage = sum / globalFilteredUsersCountries.length;
  console.log(`sum: ${sum} ava: ${avarage}`);
  return avarage.toFixed(2);
}

function calculateNumberFilteredUsers() {
  console.log(globalFilteredUsersCountries.length);
  return globalFilteredUsersCountries.length;
}

start();
