document.getElementById("submit").addEventListener("click", function(event) {
    event.preventDefault();
    
    var dateFrom = document.getElementById("dateFrom").value;
    var dateTo = document.getElementById("dateTo").value;
    var dataType = document.getElementById("dataType").value;

    var errorMessage = document.getElementById("error-message");
    errorMessage.innerHTML = ""; 

    if (!dataType || dataType === "Данные для анализа") {
        errorMessage.innerHTML += "Пожалуйста, выберите данные для анализа.<br>";
    }
    if (!dateFrom || !dateTo) {
        errorMessage.innerHTML += "Пожалуйста, выберите начальную и конечную даты.<br>";
    }
    if (dateFrom >= dateTo) {
        errorMessage.innerHTML += "Начальная дата должна быть меньше конечной даты.<br>";
    }

    if (!errorMessage.innerHTML) {
    }
});

