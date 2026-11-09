
const accounts = [
  { user: "admin", pass: "admin123", role: "ผู้ดูแลระบบ" },
  { user: "staff", pass: "staff123", role: "บุคลากร" },
  { user: "committee", pass: "committee123", role: "กรรมการ" }
];

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  const account = accounts.find(
    a => a.user === user && a.pass === pass
  );

  if (!account) {
    document.getElementById("error").textContent =
      "Username หรือ Password ไม่ถูกต้อง";
    return;
  }

  document.getElementById("login").hidden = true;
  document.getElementById("app").hidden = false;
  document.getElementById("userRole").textContent = account.role;

  showPage("dashboard");
});

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => {
    p.hidden = true;
  });

  document.getElementById(page).hidden = false;
}

function logout() {
  document.getElementById("app").hidden = true;
  document.getElementById("login").hidden = false;
  loginForm.reset();
  document.getElementById("error").textContent = "";
}
