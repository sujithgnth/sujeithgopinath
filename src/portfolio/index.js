const changeTheme = (value) => {
  document.body.classList = [`${value}`];
};

function toggleTheme(event) {
  if (event.target.id === 'darkMode' || event.target.id === 'lightMode') {
    const value = event.target.id === 'darkMode' ? 'lightMode' : 'darkMode';
    changeTheme(value);
    localStorage.setItem('themeMode', value);
  }
}

const checkThemeOnLoad = () => {
  const value = localStorage.getItem('themeMode') || 'darkMode';
  if (value) {
    changeTheme(value);
  }
};

window.onload = () => {
  checkThemeOnLoad();
};
