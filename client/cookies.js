function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    let secure = location.protocol === 'https:' ? "Secure;" : "";
    let sameSite = "SameSite=Strict";
    document.cookie = cname + "=" + encodeURIComponent(btoa(JSON.stringify(cvalue))) + ";" + expires + ";path=/;" + secure + sameSite;
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return JSON.parse(atob(decodeURIComponent(c.substring(name.length, c.length))));
        }
    }
    return null;
}
