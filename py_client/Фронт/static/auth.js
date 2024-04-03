
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    const signUpForm = document.getElementById('signUpForm');
    const signInForm = document.getElementById('signInForm');
   

    signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
    });



    signUpForm.addEventListener('submit', function(event) {
        const loginInput = document.getElementById('signUpLogin');
        const passwordInput = document.getElementById('signUpPassword');

        if (loginInput.value.length < 8) {
            alert('Логин должен содержать не менее 8 символов');
            event.preventDefault();
        }

        if (!isStrongPassword(passwordInput.value)) {
            alert('Пароль должен содержать не менее 8 символов и состоять из букв верхнего и нижнего регистра, цифр и специальных символов');
            event.preventDefault();
        }
    });

    signInForm.addEventListener('submit', function(event) {
        const loginInput = document.getElementById('signInLogin');
        const passwordInput = document.getElementById('signInPassword');

        if (loginInput.value.length < 8) {
            alert('Логин должен содержать не менее 8 символов');
            event.preventDefault();
        }

        if (passwordInput.value.length < 8) {
            alert('Пароль должен содержать не менее 8 символов');
            event.preventDefault();
        }
    });

    function isStrongPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{"':;?/>.<,])[A-Za-z\d!@#$%^&*()_+}{"':;?/>.<,]{8,}$/;
        return passwordRegex.test(password);
    }

