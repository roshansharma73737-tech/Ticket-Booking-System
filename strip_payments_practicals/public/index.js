let  token = '';
let strip , cardElement;
let currentransactionId = null;


async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch ('api/auth/login',{
        meethod : "POST",
        headers: { }
    })
}