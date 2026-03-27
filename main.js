function openPage()
{
    window.location.href = "teacher.html"
}
function studPage()
{
    window.location.href = "studnet.html"
}

function clearAllData() {
  if (confirm("Are you sure? All data will be deleted!")) {
    localStorage.clear();
    alert("All Data Cleared!");
    location.reload();
  }
}